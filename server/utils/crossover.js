import { calculateEMA } from "./indicators.js";

export const detectGoldenCross = (prices) => {

  if (!prices || prices.length < 220) {
    return {
      goldenCross: false,
      deathCross: false
    };
  }

  const currentEMA = calculateEMA(prices);

  const previousPrices = prices.slice(0, -1);

  const previousEMA = calculateEMA(previousPrices);

  const goldenCross =
    previousEMA.ema50 <= previousEMA.ema200 &&
    currentEMA.ema50 > currentEMA.ema200;

  const deathCross =
    previousEMA.ema50 >= previousEMA.ema200 &&
    currentEMA.ema50 < currentEMA.ema200;

  return {
    goldenCross,
    deathCross,
    ema50: currentEMA.ema50,
    ema200: currentEMA.ema200
  };
};