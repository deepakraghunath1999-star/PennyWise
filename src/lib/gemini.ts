import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateText = async (prompt: string, systemInstruction?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a helpful creative assistant.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
