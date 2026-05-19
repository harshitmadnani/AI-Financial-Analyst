import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const analyzeTrade = async (stock) => {
  const { symbol, price, rsi, score, bias } = stock;



  const prompt = `
You are a professional intraday trader.

Analyze this setup strictly using given data.

Stock: ${symbol}
Price: ${price}
RSI: ${rsi}
Bias: ${bias}
Score: ${score}/6

IMPORTANT RULES:

- RSI < 35 = Oversold
- RSI > 65 = Overbought
- RSI 35–65 = Neutral

- If bias = SELL → focus on bearish reasoning
- If bias = BUY → focus on bullish reasoning

---

Give STRICT output:

Reason:
- 1 line (correct interpretation only)

Trade:
- Entry:
- Stop Loss:
- Target:

Rules:
- No paragraphs
- No contradictions
- No wrong RSI interpretation
- Be precise
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
};