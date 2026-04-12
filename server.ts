import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { runSimulation } from "./src/lib/monteCarlo.js";
import Groq from "groq-sdk";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GROQ_API_KEY is not configured in Settings > Secrets" });
      }
      const groq = new Groq({ apiKey });
      
      const { messages, system } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages
        ],
        model: "llama-3.3-70b-versatile",
      });
      res.json({ text: completion.choices[0]?.message?.content || "" });
    } catch (error: any) {
      console.error("Groq Error:", error);
      res.status(500).json({ error: error.message || "Failed to call Groq" });
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
