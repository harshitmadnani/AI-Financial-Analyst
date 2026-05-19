import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const analyzeScreenerWithAI = async (stocksData) => {
  const prompt = `
You are an advanced stock trading screener used by professional traders.

Your goal is to scan multiple stocks and return ONLY high-probability trade setups.

INPUT DATA:
${JSON.stringify(stocksData)}

STRICT RULES:
- RSI < 35 → Oversold → Buy potential
- RSI > 65 → Overbought → Sell potential
- MACD > Signal → Bullish
- MACD < Signal → Bearish
- Price > EMA9 > EMA50 → Uptrend
- Price < EMA9 < EMA50 → Downtrend

Return ONLY JSON:

{
  "results": [
    {
      "symbol": "",
      "setup": "BUY | SELL | WATCHLIST",
      "reason": {
        "rsi": "",
        "macd": "",
        "ema": ""
      },
      "tradePlan": {
        "entry": "",
        "stopLoss": "",
        "target1": "",
        "target2": ""
      },
      "strength": "HIGH | MEDIUM | LOW"
    }
  ]
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
};