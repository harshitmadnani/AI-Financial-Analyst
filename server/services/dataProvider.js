// import axios from "axios";
// import { getStockData, getStockQuote } from "./stockService.js";

// const TWELVE_API_KEY = process.env.TWELVE_API_KEY;

// // 🔥 CACHE
// const cache = new Map();

// // 🔥 HELPER
// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// // 🔥 RATE LIMIT TRACKER
// let twelveCalls = 0;
// const MAX_TWELVE_CALLS = 500; // safety (below 800)

// /* =========================
//    🔥 HYBRID QUOTE
// ========================= */
// export const getReliableQuote = async (symbol) => {
//   const cacheKey = `quote-${symbol}`;

//   // ✅ CACHE (30 sec)
//   if (cache.has(cacheKey)) {
//     return cache.get(cacheKey);
//   }

//   // =========================
//   // 1️⃣ YAHOO (PRIMARY)
//   // =========================
//   try {
//     const quote = await getStockQuote(symbol);

//     if (quote?.price && quote.price !== 0) {
//       console.log("✅ Yahoo:", symbol);

//       cache.set(cacheKey, quote);
//       setTimeout(() => cache.delete(cacheKey), 30000);

//       return quote;
//     }

//     console.log("⚠️ Yahoo failed:", symbol);

//   } catch (err) {
//     console.log("❌ Yahoo error:", symbol);
//   }

//   // =========================
//   // ❌ STOP if API limit reached
//   // =========================
//   if (twelveCalls >= MAX_TWELVE_CALLS) {
//     console.log("🚫 Twelve limit reached:", symbol);
//     return { symbol, price: null, prevClose: null };
//   }

//   // =========================
//   // 2️⃣ TWELVE (FALLBACK)
//   // =========================
//   try {
//     const cleanSymbol = symbol.replace(".NS", "");

//     const url = `https://api.twelvedata.com/price?symbol=${cleanSymbol}&exchange=NSE&apikey=${TWELVE_API_KEY}`;

//     for (let i = 0; i < 2; i++) {
//       try {
//         const res = await axios.get(url);

//         const price = Number(res.data?.price);

//         // ❌ invalid response check
//         if (!price || price === 0) {
//           throw new Error("Invalid price");
//         }

//         console.log("✅ Twelve:", symbol);

//         twelveCalls++;

//         const data = {
//           symbol,
//           price,
//           prevClose: price
//         };

//         cache.set(cacheKey, data);
//         setTimeout(() => cache.delete(cacheKey), 30000);

//         return data;

//       } catch (err) {
//         console.log(`⚠️ Retry Twelve ${i + 1}:`, symbol);
//         await sleep(300);
//       }
//     }

//   } catch (err) {
//     console.log("❌ Twelve error:", symbol);
//   }

//   // =========================
//   // 3️⃣ FINAL SAFE RETURN
//   // =========================
//   return {
//     symbol,
//     price: null,
//     prevClose: null
//   };
// };

// /* =========================
//    🔥 HYBRID STOCK DATA
// ========================= */

// export const getReliableStockData = async (symbol, config) => {

//   // =========================
//   // 1️⃣ TRY YAHOO
//   // =========================
//   try {
//     const data = await getStockData(symbol, config);

//     if (data?.history?.length > 0 && data?.prices?.length > 0) {
//       return data;
//     }

//     console.log("⚠️ Yahoo history empty:", symbol);

//   } catch (err) {
//     console.log("❌ Yahoo history error:", symbol);
//   }

//   // =========================
//   // 2️⃣ RETURN NULL (NOT EMPTY)
//   // =========================
//   return {
//     history: null,
//     prices: null
//   };
// };

import axios from "axios";
import { getStockData, getStockQuote } from "./stockService.js";

const TWELVE_API_KEY = process.env.TWELVE_API_KEY;

// =========================
// 🔥 CACHE SYSTEM
// =========================
const cache = new Map();

const getCache = (key, ttl) => {
  if (cache.has(key)) {
    const { data, time } = cache.get(key);

    if (Date.now() - time < ttl) {
      console.log("🟡 CACHE HIT:", key);
      return data;
    }

    cache.delete(key);
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    time: Date.now()
  });
};

// =========================
// 🔥 RATE LIMIT CONTROL
// =========================
let twelveCalls = 0;
const MAX_TWELVE_CALLS = 500;

// reset every minute
setInterval(() => {
  twelveCalls = 0;
}, 60000);

// =========================
// 🔥 HELPER
// =========================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* =========================
   🔥 HYBRID QUOTE
========================= */
export const getReliableQuote = async (symbol) => {
  const cacheKey = `quote-${symbol}`;

  // ✅ CACHE (30 sec)
  const cached = getCache(cacheKey, 30000);
  if (cached) return cached;

  // =========================
  // 1️⃣ YAHOO
  // =========================
  try {
    const quote = await getStockQuote(symbol);

    if (quote?.price && quote.price > 0) {
      console.log("✅ Yahoo:", symbol);

      setCache(cacheKey, quote);
      return quote;
    }

    console.log("⚠️ Yahoo failed:", symbol);

  } catch (err) {
    console.log("❌ Yahoo error:", symbol);
  }

  // =========================
  // 2️⃣ TWELVE FALLBACK
  // =========================
  if (twelveCalls >= MAX_TWELVE_CALLS) {
    console.log("🚫 Twelve limit reached:", symbol);
    return { symbol, price: null, prevClose: null };
  }

  try {
    const cleanSymbol = symbol.replace(".NS", "");

    const url = `https://api.twelvedata.com/price?symbol=${cleanSymbol}&exchange=NSE&apikey=${TWELVE_API_KEY}`;

    for (let i = 0; i < 2; i++) {
      try {
        const res = await axios.get(url);

        const price = Number(res.data?.price);

        if (!price || price === 0) {
          throw new Error("Invalid price");
        }

        console.log("✅ Twelve:", symbol);

        twelveCalls++;

        const data = {
          symbol,
          price,
          prevClose: price
        };

        setCache(cacheKey, data);
        return data;

      } catch (err) {
        console.log(`⚠️ Retry Twelve ${i + 1}:`, symbol);
        await sleep(300);
      }
    }

  } catch (err) {
    console.log("❌ Twelve error:", symbol);
  }

  return {
    symbol,
    price: null,
    prevClose: null
  };
};

/* =========================
   🔥 HYBRID STOCK DATA
========================= */

export const getReliableStockData = async (symbol, config) => {
  const cacheKey = `stock-${symbol}-${config.interval}`;

  // ✅ CACHE (5 min)
  const cached = getCache(cacheKey, 5 * 60 * 1000);
  if (cached) return cached;

  try {
    const data = await getStockData(symbol, config);

    if (data?.history?.length > 0 && data?.prices?.length > 0) {
      setCache(cacheKey, data);
      console.log("🟢 FETCHED:", symbol);
      return data;
    }

    console.log("⚠️ Yahoo history empty:", symbol);

  } catch (err) {
    console.log("❌ Yahoo history error:", symbol);
  }

  return {
    history: null,
    prices: null
  };
};