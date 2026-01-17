import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const improveWithAi = async (req, res) => {
  const { question } = req.body;

  const prompt = `Improve and enhance the clarity, impact, and conciseness of this post: "${question}".

IMPORTANT:
1. Return only the improved post—no explanations or extra text.
2. Keep the output **concise and under 500 characters**. If it's already brief, keep it that way.
3. If the provided post is gibberish, return it unchanged without suggestions or explanations.`;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();
    const cleanedAnswer = answer
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")
      .trim();
    res.status(200).json({ answer: cleanedAnswer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
