import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// 🔥 SWITCH (TURN AI ON/OFF)
const ENABLE_AI = false;

// 🔥 SAFE INIT (NO CRASH)
let client = null;

if (ENABLE_AI && process.env.OPENAI_API_KEY) {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.log("⚠️ OpenAI disabled");
}

// 🔥 MAIN FUNCTION
export const analyzeTrade = async (stock) => {
  const { symbol, price, rsi } = stock;

  try {
    // ❌ NO AI → FREE LOGIC
    if (!client) {
      if (rsi < 30) {
        return "Oversold → BUY setup possible";
      } else if (rsi > 70) {
        return "Overbought → SELL setup possible";
      } else {
        return "Neutral → wait for breakout";
      }
    }

    // ✅ AI PROMPT
    const prompt = `
You are a professional trader.

Given:
Symbol: ${symbol}
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
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });

    return response.choices?.[0]?.message?.content || "No analysis";

  } catch (error) {
    console.error("AI ERROR:", error.message);

    // 🔥 FAIL SAFE (NO CRASH)
    return "Analysis unavailable";
  }
};