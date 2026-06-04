// import YahooFinance from "yahoo-finance2";

// const yahooFinance = new YahooFinance();

// export const getStockData = async (symbol, config) => {
//   try {
//     const now = Math.floor(Date.now() / 1000);

//     // 🔥 Range → seconds
//     const rangeMap = {
//       "1d": 1 * 24 * 60 * 60,
//       "5d": 5 * 24 * 60 * 60,
//       "1mo": 30 * 24 * 60 * 60,
//       "1y": 365 * 24 * 60 * 60
//     };

//     const period2 = now;
//     const period1 = now - (rangeMap[config.range] || rangeMap["1d"]);

//     const result = await yahooFinance.chart(symbol, {
//       period1,
//       period2,
//       interval: config.interval
//     });

//     const quote = result?.quotes || [];

//     // 🚨 HARD FAIL (GOOD PRACTICE)
//     if (!quote.length) {
//       throw new Error(`No market data for ${symbol}`);
//     }

//     // ✅ CLEAN HISTORY (NO META HERE)
//     const history = quote.map(q => ({
//       time: new Date(q.date).toISOString(),
//       open: Number(q.open ?? 0),
//       high: Number(q.high ?? 0),
//       low: Number(q.low ?? 0),
//       close: Number(q.close ?? 0),
//       volume: Number(q.volume ?? 0)
//     }));

//     // ✅ CLOSE PRICES FOR RSI
//     const prices = history.map(h => h.close).filter(p => p > 0);

//     if (!prices.length) {
//       throw new Error(`Invalid price data for ${symbol}`);
//     }

//     // ✅ RETURN META SEPARATELY (IMPORTANT)
//     return {
//       history,
//       prices,
//       meta: result.meta || {}
//     };

//   } catch (err) {
//     throw new Error(`Fetch failed for ${symbol}`);
//   }
// };

// // 🔥 NEW FUNCTION (REAL MARKET DATA)
// export const getStockQuote = async (symbol) => {
//   try {
//     const quote = await yahooFinance.quote(symbol);

//     return {
//       symbol,
//       price: quote.regularMarketPrice,
//       prevClose: quote.regularMarketPreviousClose,
//       changePercent: quote.regularMarketChangePercent
//     };

//   } catch (err) {
//     console.error("QUOTE ERROR:", symbol);
//     return null;
//   }
// };


import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"]
});

// 🔥 SMALL HELPER
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* =========================
   🔥 SAFE CHART DATA
========================= */
export const getStockData = async (symbol, config, retries = 2) => {
  const now = Math.floor(Date.now() / 1000);

const rangeMap = {
  "1d": 1 * 24 * 60 * 60,
  "5d": 5 * 24 * 60 * 60,
  "1mo": 30 * 24 * 60 * 60,
  "3mo": 90 * 24 * 60 * 60,
  "6mo": 180 * 24 * 60 * 60,
  "1y": 365 * 24 * 60 * 60
};

  const period2 = now;
  const period1 = now - (rangeMap[config.range] || rangeMap["1d"]);
  console.log(
  "Range:",
  config.range,
  "Interval:",
  config.interval
);

  for (let i = 0; i <= retries; i++) {
    try {
      const result = await yahooFinance.chart(symbol, {
        period1,
        period2,
        interval: config.interval
      });

      const quote = result?.quotes || [];

      // ❌ Instead of throw → return safe empty
      if (!quote.length) {
        console.log("⚠️ No data:", symbol);
        return { history: [], prices: [], meta: {} };
      }

      const history = quote.map(q => ({
        time: new Date(q.date).toISOString(),
        open: Number(q.open ?? 0),
        high: Number(q.high ?? 0),
        low: Number(q.low ?? 0),
        close: Number(q.close ?? 0),
        volume: Number(q.volume ?? 0)
      }));

      const prices = history
        .map(h => h.close)
        .filter(p => p > 0);

      if (!prices.length) {
        console.log("⚠️ Invalid prices:", symbol);
        return { history: [], prices: [], meta: {} };
      }

      return {
        history,
        prices,
        meta: result.meta || {}
      };

    } catch (err) {
      console.log(`❌ Retry ${i + 1} failed for ${symbol}`);

      if (i < retries) {
        await sleep(500); // 🔥 retry delay
      } else {
        return { history: [], prices: [], meta: {} };
      }
    }
  }
};

/* =========================
   🔥 SAFE QUOTE (CRITICAL FIX)
========================= */
export const getStockQuote = async (symbol, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const quote = await yahooFinance.quote(symbol);

      const price = quote?.regularMarketPrice;
      const prevClose = quote?.regularMarketPreviousClose;

      // ❌ invalid data check
      if (!price || price === 0) {
        throw new Error("Invalid price");
      }

      return {
        symbol,
        price: Number(price.toFixed(2)),
        prevClose: Number((prevClose || price).toFixed(2)),
        changePercent: Number(
          ((price - prevClose) / prevClose * 100).toFixed(2)
        )
      };

    } catch (err) {
      console.log(`❌ Quote retry ${i + 1} failed:`, symbol);

      if (i < retries) {
        await sleep(500);
      } else {
        // 🔥 FINAL SAFE FALLBACK
        return {
          symbol,
          price: null,
          prevClose: null,
          changePercent: 0
        };
      }
    }
  }
};