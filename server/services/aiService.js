import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const analyzeTrade = async (stock) => {
  const { symbol, price, rsi, score, bias } = stock;


const prompt = `
You are a professional trader.

Given:
Price: ${price}
RSI: ${rsi}

Rules:
- If RSI < 30 → BUY setup
- If RSI > 70 → SELL setup

IMPORTANT:
- Entry = current price
- StopLoss must be BELOW entry for BUY
- Target must be ABOVE entry for BUY
- For SELL reverse logic

Return only clean trade explanation.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
};