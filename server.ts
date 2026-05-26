import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { runSimulation } from "./src/lib/monteCarlo.js";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, system } = req.body;
    let groqError: string | null = null;
    let isRestricted = false;

    // 1. Try Groq (Llama fallback chain) first
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      // Clean and standard models
      const modelsToTry = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama3-8b-8192"
      ];

      const groq = new Groq({ apiKey: groqKey });
      
      for (const model of modelsToTry) {
        try {
          console.log(`Attempting Groq query with model: ${model}`);
          const completion = await groq.chat.completions.create({
            messages: [
              ...(system ? [{ role: "system", content: system }] : []),
              ...messages
            ],
            model: model,
          });
          const content = completion.choices[0]?.message?.content || "";
          console.log(`Groq query succeeded using model: ${model}`);
          return res.json({ text: content, engine: "groq", model });
        } catch (error: any) {
          console.warn(`Groq execution failed with model ${model}. Error:`, error.message || error);
          groqError = error.message || String(error);
          
          if (groqError.includes("organization_restricted") || groqError.includes("restricted")) {
            isRestricted = true;
            // No need to try other models if the entire org is restricted
            break;
          }
        }
      }
    } else {
      console.warn("GROQ_API_KEY is missing.");
      groqError = "GROQ_API_KEY is not defined in your environment secrets.";
    }

    // Prepare clear error message
    let friendlyError = "Failed to call AI.";
    if (isRestricted) {
      friendlyError = "Your Groq API key's organization has been restricted. Please generate a new key on Groq or fix your Groq billing/tier settings.";
    } else if (groqError) {
      friendlyError = `Groq API Error: ${groqError}`;
    }

    // 2. Fallback to Gemini 3.5 Flash if available as extra fallback
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error(friendlyError);
      }

      console.log("Trying Gemini 3.5 Flash fallback...");
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let prompt = "Hello";
      if (messages && messages.length > 0) {
        prompt = messages.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n\n");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: system || "You are a world-class financial advisor specializing in retirement planning.",
        },
      });

      const textValue = response.text || "";
      return res.json({ text: textValue, engine: "gemini-fallback", originalError: friendlyError });
    } catch (geminiError: any) {
      console.error("Gemini fallback also failed:", geminiError.message || geminiError);
      return res.status(500).json({
        error: friendlyError,
        groqError: groqError,
        geminiError: geminiError.message || String(geminiError)
      });
    }
  });

  app.post("/api/simulation/run", (req, res) => {
    try {
      const params = req.body;
      const result = runSimulation(params);
      res.json(result);
    } catch (error) {
      console.error("Simulation Error:", error);
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
