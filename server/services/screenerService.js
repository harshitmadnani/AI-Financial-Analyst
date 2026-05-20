import { getStockData } from "./stockService.js";
import { calculateRSI, calculateMACD, calculateEMA } from "../utils/indicators.js";

const STOCK_LIST = [
  "RELIANCE.NS",
  "TCS.NS",
  "INFY.NS",
  "HDFCBANK.NS"
];

// 🧠 Scoring Function (CORE LOGIC)
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
  if (stock.macd.macd > stock.macd.signal) {
    score += 2;
    buyPoints += 2;
  } else {
    score += 2;
    sellPoints += 2;
  }

  // 📈 EMA Trend
  if (stock.price > stock.ema9 && stock.ema9 > stock.ema50) {
    score += 2;
    buyPoints += 2;
  } else if (stock.price < stock.ema9 && stock.ema9 < stock.ema50) {
    score += 2;
    sellPoints += 2;
  }

  // 🎯 Final Bias
  const bias = buyPoints > sellPoints ? "BUY" : "SELL";

  return {
    ...stock,
    score,
    bias
  };
};

export const runScreener = async () => {
  const results = [];

  for (const symbol of STOCK_LIST) {
    try {
let { history, prices } = await getStockData(symbol, config);
      if (!prices || prices.length < 60) continue;

      const price = prices[prices.length - 1];

      // Indicators
      const rsi = calculateRSI(prices);
      const macd = calculateMACD(prices);
      const ema = calculateEMA(prices);

      const stockData = {
        symbol,
        price,
        rsi,
        macd,
        ema9: ema.ema9,
        ema50: ema.ema50
      };

      const scoredStock = scoreStock(stockData);

      results.push(scoredStock);

    } catch (err) {
      console.log(`Error for ${symbol}`, err.message);
    }
  }

  // 🔥 Filter + Sort + Top Picks
  return results
    .filter(stock => stock.score >= 3)     // remove weak setups
    .sort((a, b) => b.score - a.score)    // best first
    .slice(0, 3);                         // top 3 only
};