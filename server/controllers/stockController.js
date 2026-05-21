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



    if (!prices || prices.length === 0) {
      throw new Error("No valid price data");
    }

    // const latestPrice = prices[prices.length - 1];
    const quote = await getStockQuote(symbol);

const latestPrice = quote?.price || prices[prices.length - 1];
const prevClose = quote?.prevClose || latestPrice;

const change = latestPrice - prevClose;
const changePercent = (change / prevClose) * 100;


    // 📉 RSI
    let rsi = calculateRSI(prices);
    if (!rsi || isNaN(rsi)) rsi = 50;


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


    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await getStockQuote(symbol);

          if (!quote || !quote.price || !quote.prevClose) return null;


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


    const gainers = [...filtered]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);

    const losers = [...filtered]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);

 
    res.json({ gainers, losers });

  } catch (err) {
    console.error("❌ TOP MOVERS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};






// export const getRSIScreener = async (req, res) => {
//   try {

//     const symbols = Array.isArray(req.body.symbols)
//       ? req.body.symbols
//       : [];


//     const results = await Promise.all(
//       symbols.map(async (symbol) => {
//         try {
//           const { prices } = await getStockData(symbol, {
//             range: "1mo",
//             interval: "60m"
//           });

//           if (!prices || prices.length < 20) {
//             return null;
//           }

//           const rsi = calculateRSI(prices);


//           return {
//             symbol,
//             rsi: Number((rsi || 50).toFixed(2))
//           };

//         } catch (err) {
//           console.log("❌ Error:", symbol);
//           return null;
//         }
//       })
//     );

//     const filtered = results.filter(Boolean);


//     // 🔥 STEP 1: STRICT FILTER
//     let oversold = filtered
//       .filter((s) => s.rsi >= 20 && s.rsi <= 35)
//       .sort((a, b) => a.rsi - b.rsi);

//     let overbought = filtered
//       .filter((s) => s.rsi >= 65 && s.rsi <= 80)
//       .sort((a, b) => b.rsi - a.rsi);



//     // 🔥 STEP 2: FILL IF LESS THAN 10
//     if (oversold.length < 10) {
//       console.log("⚠️ Filling oversold...");
//       const extra = filtered
//         .sort((a, b) => a.rsi - b.rsi)
//         .filter(s => !oversold.find(o => o.symbol === s.symbol)) // avoid duplicates
//         .slice(0, 10 - oversold.length);

//       oversold = [...oversold, ...extra];
//     }

//     if (overbought.length < 10) {
//       const extra = filtered
//         .sort((a, b) => b.rsi - a.rsi)
//         .filter(s => !overbought.find(o => o.symbol === s.symbol))
//         .slice(0, 10 - overbought.length);

//       overbought = [...overbought, ...extra];
//     }

//     // 🔥 STEP 3: FINAL LIMIT
//     oversold = oversold.slice(0, 10);
//     overbought = overbought.slice(0, 10);

//     console.log("✅ Final Oversold:", oversold.length);
//     console.log("✅ Final Overbought:", overbought.length);

//     res.json({ oversold, overbought });

//   } catch (err) {
//     console.error("❌ RSI SCREENER ERROR:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };


export const getRSIScreener = async (req, res) => {
  try {
    console.log("\n========== RSI SCREENER ==========");

    const symbols = Array.isArray(req.body.symbols)
      ? req.body.symbols
      : [];

    console.log("Total Symbols:", symbols.length);

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const [data15m, data1h] = await Promise.all([
            getStockData(symbol, { range: "5d", interval: "15m" }),
            getStockData(symbol, { range: "1mo", interval: "60m" })
          ]);

          if (!data15m?.prices || !data1h?.prices) {
            console.log("❌ No data:", symbol);
            return null;
          }

          if (data15m.prices.length < 20 || data1h.prices.length < 20) {
            console.log("❌ Not enough candles:", symbol);
            return null;
          }

          const rsi15m = calculateRSI(data15m.prices);
          const rsi1h = calculateRSI(data1h.prices);

          console.log(
            `📊 ${symbol} → RSI15m: ${rsi15m}, RSI1H: ${rsi1h}`
          );

          return {
            symbol,
            rsi15m: Number((rsi15m || 50).toFixed(2)),
            rsi1h: Number((rsi1h || 50).toFixed(2))
          };

        } catch (err) {
          console.log("❌ Error:", symbol);
          return null;
        }
      })
    );

    const filtered = results.filter(Boolean);

    console.log("✅ Valid Stocks:", filtered.length);

    // ✅ STRICT FILTER ONLY (NO FALLBACK)
    const oneHour = {
      oversold: filtered
        .filter((s) => s.rsi1h >= 20 && s.rsi1h <= 30)
        .sort((a, b) => a.rsi1h - b.rsi1h)
        .slice(0, 10),

      overbought: filtered
        .filter((s) => s.rsi1h >= 70 && s.rsi1h <= 80)
        .sort((a, b) => b.rsi1h - a.rsi1h)
        .slice(0, 10)
    };

    const fifteenMin = {
      oversold: filtered
        .filter((s) => s.rsi15m >= 20 && s.rsi15m <= 30)
        .sort((a, b) => a.rsi15m - b.rsi15m)
        .slice(0, 10),

      overbought: filtered
        .filter((s) => s.rsi15m >= 70 && s.rsi15m <= 80)
        .sort((a, b) => b.rsi15m - a.rsi15m)
        .slice(0, 10)
    };

    console.log("📉 1H Oversold:", oneHour.oversold.length);
    console.log("📈 1H Overbought:", oneHour.overbought.length);

    console.log("📉 15M Oversold:", fifteenMin.oversold.length);
    console.log("📈 15M Overbought:", fifteenMin.overbought.length);

    res.json({
      oneHour,
      fifteenMin
    });

  } catch (err) {
    console.error("❌ RSI SCREENER ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};