import { getStockData } from "../services/stockService.js";
import { calculateRSI } from "../utils/indicators.js";
import { analyzeTrade } from "../services/aiService.js";

export const getStock = async (req, res) => {
  const { symbol } = req.params;
  const { interval = "1D" } = req.query;

  const intervalMap = {
    "1D": { range: "1d", interval: "5m" },
    "1W": { range: "5d", interval: "15m" },
    "1M": { range: "1mo", interval: "1d" },
    "1Y": { range: "1y", interval: "1wk" }
  };

  const config = intervalMap[interval] || intervalMap["1D"];

  try {
    // 📊 Fetch data
    let { history, prices } = await getStockData(symbol, config);

    // 🔥 fallback (safe)
    if (!prices || prices.length === 0) {
      prices = [100, 102, 101, 105, 103];
      history = prices.map((p, i) => ({
        time: `Day ${i}`,
        open: p,
        high: p + 2,
        low: p - 2,
        close: p,
        volume: 1000
      }));
    }

    // 📈 Latest price
    const latestPrice = prices[prices.length - 1];

    // 📉 RSI
    let rsi = calculateRSI(prices);
    if (!rsi || isNaN(rsi)) rsi = 50;

    // 🎯 Bias
    let bias = "NEUTRAL";
    if (rsi < 30) bias = "BUY";
    else if (rsi > 70) bias = "SELL";

    // 🎯 Trade Levels
    const entry = Number(latestPrice.toFixed(2));
    let stopLoss, target;

    if (bias === "BUY") {
      stopLoss = Number((latestPrice * 0.99).toFixed(2));
      target = Number((latestPrice * 1.02).toFixed(2));
    } else if (bias === "SELL") {
      stopLoss = Number((latestPrice * 1.01).toFixed(2));
      target = Number((latestPrice * 0.98).toFixed(2));
    } else {
      stopLoss = Number((latestPrice * 0.98).toFixed(2));
      target = Number((latestPrice * 1.02).toFixed(2));
    }

    // 🤖 AI
    const aiAnalysis = await analyzeTrade({
      symbol,
      price: latestPrice,
      rsi
    });

    // 🔥 Smart trimming (important)
    const trimmedHistory =
      interval === "1D" ? history.slice(-120) :
      interval === "1W" ? history.slice(-150) :
      interval === "1M" ? history.slice(-200) :
      history.slice(-300);

    // 📤 Response
    res.json({
      symbol,
      price: latestPrice,
      rsi: Number(rsi.toFixed(2)),
      bias,
      history: trimmedHistory,
      entry,
      stopLoss,
      target,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error("Controller Error:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
};



// ✅ TOP MOVERS FIXED
export const getTopMovers = async (req, res) => {
  try {
    const symbols = req.body.symbols;

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const { prices } = await getStockData(symbol, {
          range: "1d",
          interval: "5m"
        });

        if (!prices || prices.length < 2) return null;

        const first = prices[0];
        const last = prices[prices.length - 1];

        const changePercent = ((last - first) / first) * 100;

        return {
          symbol,
          price: last,
          changePercent
        };
      })
    );

    const filtered = results.filter(Boolean);

    const gainers = [...filtered]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);

    const losers = [...filtered]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);

    res.json({ gainers, losers });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};