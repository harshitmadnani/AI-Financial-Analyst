import { getStockData } from "../services/stockService.js";
import { calculateRSI } from "../utils/indicators.js";
import { analyzeTrade } from "../services/aiService.js";

export const getStock = async (req, res) => {
  const { symbol } = req.params;

  try {
    // 📊 Fetch data
    let prices = await getStockData(symbol);

    // 🔥 Fallback (avoid crash)
    if (!prices || prices.length === 0) {
      prices = [100, 102, 101, 105, 103];
    }

    // 📈 Latest price
    const latestPrice = prices[prices.length - 1];

    // 📉 RSI
    let rsi = calculateRSI(prices);

    if (!rsi || isNaN(rsi)) {
      rsi = 50; // neutral fallback
    }
    // 🎯 Bias logic
    let bias = "NEUTRAL";
    if (rsi < 30) bias = "BUY";
    else if (rsi > 70) bias = "SELL";

    // 🤖 AI
    const aiAnalysis = await analyzeTrade({
      symbol,
      price: latestPrice,
      rsi
    });

    // 📤 Response
    res.json({
      symbol,
      price: latestPrice,
      rsi: rsi.toFixed(2),
      bias,
      score: 3,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error("Controller Error:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
};