import { getStockData, getStockQuote } from "../services/stockService.js";
import { calculateRSI } from "../utils/indicators.js";
import { analyzeTrade } from "../services/aiService.js";

// 🔥 SETTINGS
const ENABLE_AI = false;
const aiCache = new Map();

/* =========================
   📊 SINGLE STOCK API
========================= */
export const getStock = async (req, res) => {
  const { symbol } = req.params;
  const { interval = "1D" } = req.query;

  console.log("\n========== STOCK API ==========");
  console.log("Symbol:", symbol, "| Interval:", interval);

  const intervalMap = {
    "1D": { range: "1d", interval: "5m" },
    "1W": { range: "5d", interval: "15m" },
    "1M": { range: "1mo", interval: "1d" },
    "1Y": { range: "1y", interval: "1wk" }
  };

  const config = intervalMap[interval] || intervalMap["1D"];

  try {
    // 🔥 1. CHART DATA
    const { history, prices } = await getStockData(symbol, config);

    console.log("Prices length:", prices.length);
    console.log("Latest candle:", prices[prices.length - 1]);

    if (!prices || prices.length === 0) {
      throw new Error("No valid price data");
    }

    // const latestPrice = prices[prices.length - 1];
    const quote = await getStockQuote(symbol);

const latestPrice = quote?.price || prices[prices.length - 1];
const prevClose = quote?.prevClose || latestPrice;

const change = latestPrice - prevClose;
const changePercent = (change / prevClose) * 100;

    // 🔥 2. REAL MARKET DATA (FIXED)

    console.log("QUOTE:", quote);



    console.log("PrevClose:", prevClose);
    console.log("Change:", change);
    console.log("Change %:", changePercent);

    // 📉 RSI
    let rsi = calculateRSI(prices);
    if (!rsi || isNaN(rsi)) rsi = 50;

    console.log("RSI:", rsi);

    // 🎯 Bias
    let bias = "NEUTRAL";
    if (rsi < 30) bias = "BUY";
    else if (rsi > 70) bias = "SELL";

    // 🎯 Trade Levels
    const entry = +latestPrice.toFixed(2);
    let stopLoss, target;

    if (bias === "BUY") {
      stopLoss = +(latestPrice * 0.99).toFixed(2);
      target = +(latestPrice * 1.02).toFixed(2);
    } else if (bias === "SELL") {
      stopLoss = +(latestPrice * 1.01).toFixed(2);
      target = +(latestPrice * 0.98).toFixed(2);
    } else {
      stopLoss = +(latestPrice * 0.98).toFixed(2);
      target = +(latestPrice * 1.02).toFixed(2);
    }

    // 🤖 AI (SAFE)
    const today = new Date().toDateString();
    const cacheKey = `${symbol}-${today}`;

    let aiAnalysis;

    if (ENABLE_AI) {
      if (aiCache.has(cacheKey)) {
        aiAnalysis = aiCache.get(cacheKey);
      } else {
        try {
          aiAnalysis = await analyzeTrade({
            symbol,
            price: latestPrice,
            rsi
          });
          aiCache.set(cacheKey, aiAnalysis);
        } catch {
          aiAnalysis = "AI unavailable";
        }
      }
    } else {
      if (rsi < 30) aiAnalysis = "Oversold → possible bounce";
      else if (rsi > 70) aiAnalysis = "Overbought → possible correction";
      else aiAnalysis = "Neutral trend";
    }

    // 🔥 MULTI TF RSI
    const rsiMap = {};
    const rsiConfigs = {
      "5m": { range: "1d", interval: "5m" },
      "15m": { range: "5d", interval: "15m" },
      "1h": { range: "1mo", interval: "60m" },
      "2h": { range: "1mo", interval: "60m" },
      "1D": { range: "1y", interval: "1d" }
    };

    for (const key in rsiConfigs) {
      try {
        const { prices: tfPrices } = await getStockData(symbol, rsiConfigs[key]);

        let val = calculateRSI(tfPrices);
        rsiMap[key] = Number((val || 50).toFixed(2));
      } catch {
        rsiMap[key] = 50;
      }
    }

    // 🔥 CLEAN CHART
    const trimmedHistory =
      interval === "1D" ? history.slice(-40) :
      interval === "1W" ? history.slice(-80) :
      interval === "1M" ? history.slice(-120) :
      history.slice(-200);

    console.log("Final Price:", latestPrice);

    res.json({
      symbol,
      price: latestPrice,
      change: +change.toFixed(2),               // ✅ FIXED
      changePercent: +changePercent.toFixed(2), // ✅ FIXED
      rsi: Number(rsi.toFixed(2)),
      rsiMap,
      bias,
      history: trimmedHistory,
      entry,
      stopLoss,
      target,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error("❌ STOCK ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};


/* =========================
   🚀 TOP MOVERS API (FIXED)
========================= */
export const getTopMovers = async (req, res) => {
  try {
    console.log("\n========== TOP MOVERS ==========");

    const symbols = Array.isArray(req.body.symbols)
      ? req.body.symbols
      : [];

    console.log("Symbols count:", symbols.length);

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await getStockQuote(symbol);

          if (!quote || !quote.price || !quote.prevClose) return null;

          console.log(symbol, "=>", quote.changePercent);

          return {
            symbol,
            price: Number(quote.price.toFixed(2)),
            changePercent: Number(quote.changePercent.toFixed(2))
          };

        } catch (err) {
          console.log("Error in:", symbol);
          return null;
        }
      })
    );

    const filtered = results.filter(Boolean);

    console.log("Valid stocks:", filtered.length);

    const gainers = [...filtered]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);

    const losers = [...filtered]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);

    console.log("Top Gainer:", gainers[0]);
    console.log("Top Loser:", losers[0]);

    res.json({ gainers, losers });

  } catch (err) {
    console.error("❌ TOP MOVERS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};