

import { getStockData } from "./stockService.js";
import {
  calculateRSI,
  calculateMACD,
  calculateEMA
} from "../utils/indicators.js";
import { calculateSMA } from "../utils/indicators.js";

// 🔥 CONFIG (FIXED)
// const config = {
//   range: "1mo",
//   interval: "1d"
// };

const config = {
  range: "6mo",
  interval: "1h"
};

const STOCK_LIST = [
    "NIFTY.NS",
  "BANKNIFTY.NS", "RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","ICICIBANK.NS","SBIN.NS",
    "LT.NS","HINDUNILVR.NS","ITC.NS","KOTAKBANK.NS","AXISBANK.NS","BAJFINANCE.NS",
    "ASIANPAINT.NS","MARUTI.NS","SUNPHARMA.NS","TITAN.NS","ULTRACEMCO.NS",
    "NESTLEIND.NS","WIPRO.NS",
    "ADANIENT.NS","ADANIPORTS.NS","COALINDIA.NS","JSWSTEEL.NS","TATASTEEL.NS",
    "INDUSINDBK.NS","BAJAJFINSV.NS","HCLTECH.NS","DRREDDY.NS","CIPLA.NS",
    "DIVISLAB.NS","BRITANNIA.NS","EICHERMOT.NS","HEROMOTOCO.NS",
    "SHREECEM.NS","UPL.NS","TECHM.NS","TATACONSUM.NS",
    "APOLLOHOSP.NS","ADANIGREEN.NS","ADANITRANS.NS","ADANIPOWER.NS", "PIDILITIND.NS","DMART.NS","SIEMENS.NS","ABB.NS","HAVELLS.NS","DABUR.NS",
    "BANKBARODA.NS","PNB.NS","ICICIPRULI.NS","ICICIGI.NS","SBILIFE.NS",
    "HDFCLIFE.NS","INDIGO.NS","NAUKRI.NS","COLPAL.NS","GODREJCP.NS",
    "MCDOWELL-N.NS","VEDL.NS","AMBUJACEM.NS","ACC.NS","SAIL.NS",
    "JUBLFOOD.NS","BERGEPAINT.NS","TRENT.NS","MPHASIS.NS","LTIM.NS",
    "COFORGE.NS","PERSISTENT.NS","TATAELXSI.NS","KPITTECH.NS","LUPIN.NS",
    "AUROPHARMA.NS","ZYDUSLIFE.NS","TORNTPHARM.NS","ALKEM.NS",
    "BALKRISIND.NS","ASHOKLEY.NS","BHARATFORG.NS","ESCORTS.NS",
    "SRF.NS","PIIND.NS","DIXON.NS","INDIAMART.NS","PAGEIND.NS",
    "MUTHOOTFIN.NS","CHOLAFIN.NS","LICHSGFIN.NS",
    "FEDERALBNK.NS","IDFCFIRSTB.NS","BANDHANBNK.NS", "IRCTC.NS","CDSL.NS","BSE.NS","MCX.NS",
    "CLEAN.NS","ROUTE.NS","HAPPSTMNDS.NS","TANLA.NS",
    "EASEMYTRIP.NS","NAZARA.NS"
];

// 🔥 SMALL DELAY (VERY IMPORTANT)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* =========================
   🧠 SCORING FUNCTION
========================= */
const scoreStock = (stock) => {
  let score = 0;
  let buyPoints = 0;
  let sellPoints = 0;

  // 📉 RSI
  if (stock.rsi < 35) {
    score += 2;
    buyPoints += 2;
  } else if (stock.rsi > 65) {
    score += 2;
    sellPoints += 2;
  }

  // 📊 MACD
  if (stock.macd?.macd > stock.macd?.signal) {
    score += 2;
    buyPoints += 2;
  } else if (stock.macd) {
    score += 2;
    sellPoints += 2;
  }

  // 📈 EMA Trend (Short-Term)
  if (
    stock.price > stock.ema9 &&
    stock.ema9 > stock.ema50
  ) {
    score += 2;
    buyPoints += 2;
  } else if (
    stock.price < stock.ema9 &&
    stock.ema9 < stock.ema50
  ) {
    score += 2;
    sellPoints += 2;
  }

  // 🚀 Strong Uptrend (EMA50 above EMA200)
  if (
    stock.price > stock.ema200 &&
    stock.ema50 > stock.ema200
  ) {
    score += 4;
    buyPoints += 4;
  }

  // 🔻 Strong Downtrend (EMA50 below EMA200)
  if (
    stock.price < stock.ema200 &&
    stock.ema50 < stock.ema200
  ) {
    score += 4;
    sellPoints += 4;
  }

  const bias =
    buyPoints > sellPoints
      ? "BUY"
      : sellPoints > buyPoints
      ? "SELL"
      : "NEUTRAL";

  return {
    ...stock,
    score,
    buyPoints,
    sellPoints,
    bias
  };
};

/* =========================
   🚀 MAIN SCREENER
========================= */
// export const runScreener = async () => {
//   const results = [];

//   for (const symbol of STOCK_LIST) {
//     try {
//       console.log("🔍 Processing:", symbol);

//       const {  prices } = await getStockData(symbol, config);

//       // ❌ Skip bad data
//       if (!prices || prices.length < 220) {
//         console.log("⚠️ Not enough data:", symbol);
//         continue;
//       }

//       const price = prices[prices.length - 1];

//       if (!price || price === 0) {
//         console.log("⚠️ Invalid price:", symbol);
//         continue;
//       }

//       // 🔥 Indicators
//       const rsi = calculateRSI(prices);
//       const macd = calculateMACD(prices);
//       const ema = calculateEMA(prices);

//       // ❌ Skip bad indicators
//       if (!rsi || isNaN(rsi)) {
//         console.log("⚠️ RSI invalid:", symbol);
//         continue;
//       }
//       const distanceFrom200 =
//   ((price - ema.ema200) / ema.ema200) * 100;

// const ema200Signal =
//   price < ema.ema200 &&
//   ema.ema50 < ema.ema200
//     ? "BULLISH_CROSS_CANDIDATE"
//     : price > ema.ema200 &&
//       ema.ema50 > ema.ema200
//     ? "BULLISH_TREND"
//     : "BEARISH_TREND";;

//    if (!ema?.ema9 || !ema?.ema50 || !ema?.ema200) {
//   console.log("⚠️ EMA invalid:", symbol);
//   continue;
// }

//    const stockData = {
//   symbol,
//   price,
//   rsi: Number(rsi.toFixed(2)),
//   macd,
//   ema9: ema.ema9,
//   ema50: ema.ema50,
//   ema200: ema.ema200,
//   distanceFrom200,
//   ema200Signal
// };
// console.log({
//   symbol,
//   price,
//   ema9: ema.ema9,
//   ema50: ema.ema50,
//   ema200: ema.ema200,
//   rsi
// });

//       const scoredStock = scoreStock(stockData);

//       console.log("✅ Score:", symbol, scoredStock.score);

//       results.push(scoredStock);

//       // 🔥 DELAY (prevents Yahoo blocking)
//       await sleep(200);

//     } catch (err) {
//       console.log(`❌ Error for ${symbol}`, err.message);
//     }
//   }

// return results
//   .filter(
//     stock =>
//       Math.abs(stock.distanceFrom200) <= 2
//   )
//   .sort(
//     (a, b) =>
//       Math.abs(a.distanceFrom200) -
//       Math.abs(b.distanceFrom200)
//   );
// };


export const runScreener = async () => {
  const results = [];

  for (const symbol of STOCK_LIST) {
    try {
      console.log("🔍 Processing:", symbol);

      const { prices } = await getStockData(symbol, config);

      console.log(symbol, "Prices Length:", prices?.length);

      if (!prices || prices.length < 50) {
        console.log(symbol, "❌ Not enough candles");
        continue;
      }

      const price = prices[prices.length - 1];

      // DEBUG
      console.log(symbol, "Current Price:", price);

      const sma200 = calculateSMA(prices, 200);

      console.log(symbol, "SMA200:", sma200);

      if (!sma200) {
        console.log(symbol, "❌ SMA200 is undefined");
        continue;
      }

      const distanceFrom200 =
        ((price - sma200) / sma200) * 100;

      const signal =
        price < sma200
          ? "APPROACHING_FROM_BELOW"
          : "APPROACHING_FROM_ABOVE";

      const stock = {
        symbol,
        price: Number(price.toFixed(2)),
        ma200: Number(sma200.toFixed(2)),
        distanceFrom200: Number(distanceFrom200.toFixed(2)),
        signal
      };

      console.log("✅ ADDING STOCK:", stock);

      results.push(stock);

      await sleep(200);

    } catch (err) {
      console.log(`❌ Error for ${symbol}`, err.message);
    }
  }

  console.log("TOTAL RESULTS:", results.length);
  console.table(results);

  return results
  .filter(
    stock => Math.abs(stock.distanceFrom200) <= 3
  )
  .sort(
    (a, b) =>
      Math.abs(a.distanceFrom200) -
      Math.abs(b.distanceFrom200)
  );
};