// import {
//   getReliableQuote,
//   getReliableStockData
// } from "../services/dataProvider.js";

// import { calculateRSI } from "../utils/indicators.js";
// import { analyzeTrade } from "../services/aiService.js";

// // 🔥 SETTINGS
// const ENABLE_AI = false;
// const aiCache = new Map();

// /* =========================
//    📊 SINGLE STOCK API
// ========================= */

// export const getStock = async (req, res) => {
//   const { symbol } = req.params;
//   const { interval = "1D" } = req.query;

//   const intervalMap = {
//     "1D": { range: "1d", interval: "5m" },
//     "1W": { range: "5d", interval: "15m" },
//     "1M": { range: "1mo", interval: "1d" },
//     "1Y": { range: "1y", interval: "1wk" }
//   };

//   const config = intervalMap[interval] || intervalMap["1D"];

//   try {
//     const [data, quote] = await Promise.all([
//       getReliableStockData(symbol, config),
//       getReliableQuote(symbol)
//     ]);

//     const history = data?.history || null;
//     const prices = data?.prices || null;

//     // 🔥 FIX 1 — ALWAYS TRY TO SHOW PRICE
//     let latestPrice = null;

//     if (quote?.price && quote.price > 0) {
//       latestPrice = quote.price;
//     }

//     if (!latestPrice && prices?.length > 0) {
//       latestPrice = prices[prices.length - 1];
//     }

//     // ❌ TOTAL FAILURE
//     if (!latestPrice) {
//       console.log("❌ TOTAL DATA FAILURE:", symbol);

//       return res.json({
//         symbol,
//         price: 0,
//         change: 0,
//         changePercent: 0,
//         rsi: 50,
//         rsiMap: {},
//         bias: "NEUTRAL",
//         history: [],
//         entry: 0,
//         stopLoss: 0,
//         target: 0,
//         analysis: "Data unavailable"
//       });
//     }

//     // 🔥 FIX 2 — SAFE prevClose
//     let prevClose = null;

//     if (quote?.prevClose && quote.prevClose > 0) {
//       prevClose = quote.prevClose;
//     } else if (prices?.length > 1) {
//       prevClose = prices[prices.length - 2];
//     } else {
//       prevClose = latestPrice;
//     }

//     const change = latestPrice - prevClose;
//     const changePercent = prevClose
//       ? (change / prevClose) * 100
//       : 0;

//     console.log("DEBUG:", {
//       symbol,
//       quotePrice: quote?.price,
//       pricesLength: prices?.length
//     });

//     // 🔥 RSI SAFE
//     let rsi = 50;

//     if (prices && prices.length > 14) {
//       const val = calculateRSI(prices);
//       if (val && !isNaN(val)) {
//         rsi = val;
//       }
//     }

//     // 🎯 Bias
//     let bias = "NEUTRAL";
//     if (rsi < 30) bias = "BUY";
//     else if (rsi > 70) bias = "SELL";

//     // 🎯 Trade Levels
//     const entry = +latestPrice.toFixed(2);

//     let stopLoss, target;

//     if (bias === "BUY") {
//       stopLoss = +(latestPrice * 0.99).toFixed(2);
//       target = +(latestPrice * 1.02).toFixed(2);
//     } else if (bias === "SELL") {
//       stopLoss = +(latestPrice * 1.01).toFixed(2);
//       target = +(latestPrice * 0.98).toFixed(2);
//     } else {
//       stopLoss = +(latestPrice * 0.98).toFixed(2);
//       target = +(latestPrice * 1.02).toFixed(2);
//     }

//     // 🔥 FIX 3 — SAFE MULTI TF RSI
//     const rsiConfigs = {
//       "5m": { range: "1d", interval: "5m" },
//       "15m": { range: "5d", interval: "15m" },
//       "1h": { range: "1mo", interval: "60m" },
//       "1D": { range: "1y", interval: "1d" }
//     };

//     const rsiEntries = await Promise.all(
//       Object.entries(rsiConfigs).map(async ([key, cfg]) => {
//         try {
//           const tfData = await getReliableStockData(symbol, cfg);
//           const tfPrices = tfData?.prices;

//           if (!tfPrices || tfPrices.length < 14) {
//             return [key, 50];
//           }

//           const val = calculateRSI(tfPrices);

//           return [key, Number((val || 50).toFixed(2))];

//         } catch {
//           return [key, 50];
//         }
//       })
//     );

//     const rsiMap = Object.fromEntries(rsiEntries);

//     // 🔥 FIX 4 — SAFE CHART
//     let trimmedHistory = [];

//     if (history && history.length > 0) {
//       trimmedHistory =
//         interval === "1D" ? history.slice(-40) :
//         interval === "1W" ? history.slice(-80) :
//         interval === "1M" ? history.slice(-120) :
//         history.slice(-200);
//     }

//     res.json({
//       symbol,
//       price: latestPrice,
//       change: +change.toFixed(2),
//       changePercent: +changePercent.toFixed(2),
//       rsi: Number(rsi.toFixed(2)),
//       rsiMap,
//       bias,
//       history: trimmedHistory,
//       entry,
//       stopLoss,
//       target,
//       analysis: "OK"
//     });

//   } catch (error) {
//     console.error("❌ STOCK ERROR:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// /* =========================
//    🚀 TOP MOVERS
// ========================= */
// export const getTopMovers = async (req, res) => {
//   try {
//     const symbols = Array.isArray(req.body.symbols)
//       ? req.body.symbols
//       : [];

//     const results = await Promise.all(
//       symbols.slice(0, 30).map(async (symbol) => {
//         try {
//           const quote = await getReliableQuote(symbol);

//           if (!quote || !quote.price) return null;

//           return {
//             symbol,
//             price: Number(quote.price.toFixed(2)),
//             changePercent: quote.prevClose
//               ? Number(
//                   (((quote.price - quote.prevClose) / quote.prevClose) * 100).toFixed(2)
//                 )
//               : 0
//           };

//         } catch {
//           return null;
//         }
//       })
//     );

//     const filtered = results.filter(Boolean);

//     res.json({
//       gainers: [...filtered].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10),
//       losers: [...filtered].sort((a, b) => a.changePercent - b.changePercent).slice(0, 10)
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getRSIScreener = async (req, res) => {
//   try {
//     const symbols = Array.isArray(req.body.symbols)
//       ? req.body.symbols
//       : [];

//     const timeframes = {
//       fifteenMin: { range: "5d", interval: "15m", key: "rsi15m" },
//       thirtyMin: { range: "5d", interval: "30m", key: "rsi30m" },
//       oneHour: { range: "1mo", interval: "60m", key: "rsi1h" }
//     };

//     const finalResult = {};

//     for (const tf in timeframes) {
//       const { range, interval, key } = timeframes[tf];

//       const results = [];

//       for (const symbol of symbols.slice(0, 30)) {
//         try {
//           const { prices } = await getReliableStockData(symbol, {
//             range,
//             interval
//           });

//           if (!prices || prices.length < 20) continue;

//           let rsi = calculateRSI(prices);
//           if (!rsi || isNaN(rsi)) continue;

//           results.push({
//             symbol,
//             [key]: Number(rsi.toFixed(2))
//           });

//         } catch {
//           continue;
//         }
//       }

//       const oversold = results
//         .filter(s => s[key] >= 20 && s[key] <= 30)
//         .sort((a, b) => a[key] - b[key])
//         .slice(0, 10);

//       const overbought = results
//         .filter(s => s[key] >= 70 && s[key] <= 80)
//         .sort((a, b) => b[key] - a[key])
//         .slice(0, 10);

//       finalResult[tf] = { oversold, overbought };
//     }

//     res.json(finalResult);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import {
  getReliableQuote,
  getReliableStockData
} from "../services/dataProvider.js";

import { calculateRSI } from "../utils/indicators.js";
import { calculateSMA } from "../utils/indicators.js";

// =========================
// 📊 SINGLE STOCK API
// =========================
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
    const [data, quote] = await Promise.all([
      getReliableStockData(symbol, config),
      getReliableQuote(symbol)
    ]);

    const history = data?.history || null;
    const prices = data?.prices || null;

    // =========================
    // 🔥 SAFE PRICE
    // =========================
    let latestPrice = null;

    if (quote?.price && quote.price > 0) {
      latestPrice = quote.price;
    } else if (prices?.length > 0) {
      latestPrice = prices[prices.length - 1];
    }

    if (!latestPrice) {
      return res.json({
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        rsi: 50,
        rsiMap: {},
        bias: "NEUTRAL",
        history: [],
        analysis: "Data unavailable",
        status: { chart: false, price: false }
      });
    }

    // =========================
    // 🔥 FIXED PREV CLOSE
    // =========================
    let prevClose = null;

    if (quote?.prevClose && quote.prevClose > 0) {
      prevClose = quote.prevClose;
    } else if (prices && prices.length > 10) {
      prevClose = prices[Math.max(0, prices.length - 10)];
    } else {
      prevClose = latestPrice;
    }

    const change = latestPrice - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    // =========================
    // 🔥 RSI
    // =========================
    let rsi = 50;

    if (prices && prices.length > 14) {
      const val = calculateRSI(prices);
      if (val && !isNaN(val)) rsi = val;
    }

    let bias = "NEUTRAL";
    if (rsi < 30) bias = "BUY";
    else if (rsi > 70) bias = "SELL";

    // =========================
    // 🔥 MULTI TF RSI (SAFE)
    // =========================
    const rsiConfigs = {
      "5m": { range: "1d", interval: "5m" },
      "15m": { range: "5d", interval: "15m" },
      "1h": { range: "1mo", interval: "60m" },
      "1D": { range: "1y", interval: "1d" }
    };

    const rsiEntries = await Promise.all(
      Object.entries(rsiConfigs).map(async ([key, cfg]) => {
        try {
          const tfData = await getReliableStockData(symbol, cfg);
          const tfPrices = tfData?.prices;

          if (!tfPrices || tfPrices.length < 14) {
            return [key, 50];
          }

          const val = calculateRSI(tfPrices);
          return [key, Number((val || 50).toFixed(2))];

        } catch {
          return [key, 50];
        }
      })
    );

    const rsiMap = Object.fromEntries(rsiEntries);

    // =========================
    // 🔥 SAFE CHART
    // =========================
    let trimmedHistory = [];

    if (history && history.length > 0) {
      trimmedHistory =
        interval === "1D" ? history.slice(-40) :
        interval === "1W" ? history.slice(-80) :
        interval === "1M" ? history.slice(-120) :
        history.slice(-200);
    }

    res.json({
      symbol,
      price: latestPrice,
      change: +change.toFixed(2),
      changePercent: +changePercent.toFixed(2),
      rsi: Number(rsi.toFixed(2)),
      rsiMap,
      bias,
      history: trimmedHistory,
      analysis: "OK",
      status: {
        chart: trimmedHistory.length > 0,
        price: latestPrice > 0
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// =========================
// 🚀 TOP MOVERS (OPTIMIZED)
// =========================
export const getTopMovers = async (req, res) => {
  try {
    const symbols = Array.isArray(req.body.symbols)
      ? req.body.symbols
      : [];

    const results = await Promise.all(
      symbols.slice(0, 15).map(async (symbol) => {
        try {
          const quote = await getReliableQuote(symbol);

          if (!quote || !quote.price) return null;

          return {
            symbol,
            price: Number(quote.price.toFixed(2)),
            changePercent: quote.prevClose
              ? Number(
                  (((quote.price - quote.prevClose) / quote.prevClose) * 100).toFixed(2)
                )
              : 0
          };

        } catch {
          return null;
        }
      })
    );

    const filtered = results.filter(Boolean);

    res.json({
      gainers: [...filtered].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10),
      losers: [...filtered].sort((a, b) => a.changePercent - b.changePercent).slice(0, 10)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// =========================
// 📉 RSI SCREENER (FAST + PARALLEL)
// // =========================
// export const getRSIScreener = async (req, res) => {
//   try {
//     const symbols = Array.isArray(req.body.symbols)
//       ? req.body.symbols
//       : [];

//     const timeframes = {
//       fifteenMin: { range: "5d", interval: "15m", key: "rsi15m" },
//       thirtyMin: { range: "5d", interval: "30m", key: "rsi30m" },
//       oneHour: { range: "1mo", interval: "60m", key: "rsi1h" }
//     };

//     const finalResult = {};

//     for (const tf in timeframes) {
//       const { range, interval, key } = timeframes[tf];

//       const batch = symbols.slice(0, 30);

//       const results = await Promise.all(
//         batch.map(async (symbol) => {
//           try {
//             const { prices } = await getReliableStockData(symbol, {
//               range,
//               interval
//             });

//             if (!prices || prices.length < 20) return null;

//             const rsi = calculateRSI(prices);
//             if (!rsi || isNaN(rsi)) return null;

//             return {
//               symbol,
//               [key]: Number(rsi.toFixed(2))
//             };

//           } catch {
//             return null;
//           }
//         })
//       );

//       const clean = results.filter(Boolean);

//       const oversold = clean
//         .filter(s => s[key] >= 20 && s[key] <= 30)
//         .sort((a, b) => a[key] - b[key])
//         .slice(0, 10);

//       const overbought = clean
//         .filter(s => s[key] >= 70 && s[key] <= 80)
//         .sort((a, b) => b[key] - a[key])
//         .slice(0, 10);

//       finalResult[tf] = { oversold, overbought };
//     }

//     res.json(finalResult);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


export const getRSIScreener = async (req, res) => {
  try {
    const symbols = Array.isArray(req.body.symbols)
      ? req.body.symbols
      : [];

    const timeframes = {
      fifteenMin: { range: "5d", interval: "15m", key: "rsi15m" },
      thirtyMin: { range: "5d", interval: "30m", key: "rsi30m" },
      oneHour: { range: "1mo", interval: "60m", key: "rsi1h" }
    };

    const finalResult = {};

    for (const tf in timeframes) {
      const { range, interval, key } = timeframes[tf];

      const BATCH_SIZE = 10; // 🔥 SAFE LIMIT
      const allResults = [];

      for (let i = 0; i < symbols.length; i += BATCH_SIZE) {

        const batch = symbols.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
          batch.map(async (symbol) => {
            try {
              const { prices } = await getReliableStockData(symbol, {
                range,
                interval
              });

              if (!prices || prices.length < 20) return null;

              // 🔥 GET LIVE PRICE
              const quote = await getReliableQuote(symbol);

              let modifiedPrices = [...prices];

              // 🔥 INJECT LATEST PRICE
              if (quote?.price && quote.price > 0) {
                modifiedPrices[modifiedPrices.length - 1] = quote.price;
              }

              const rsi = calculateRSI(modifiedPrices);

              if (!rsi || isNaN(rsi)) return null;

              return {
                symbol,
                [key]: Number(rsi.toFixed(2))
              };

            } catch {
              return null;
            }
          })
        );

        results.forEach(r => {
          if (r) allResults.push(r);
        });

        // 🔥 DELAY (VERY IMPORTANT)
        await new Promise(r => setTimeout(r, 400));
      }

      // 🔥 FILTER RESULTS
      const oversold = allResults
        .filter(s => s[key] >= 20 && s[key] <= 30)
        .sort((a, b) => a[key] - b[key])
        .slice(0, 10);

      const overbought = allResults
        .filter(s => s[key] >= 70 && s[key] <= 80)
        .sort((a, b) => b[key] - a[key])
        .slice(0, 10);

      finalResult[tf] = { oversold, overbought };
    }

    res.json(finalResult);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};