
import { RSI, MACD, EMA } from "technicalindicators";

// RSI
export const calculateRSI = (prices) => {
  const rsi = RSI.calculate({
    values: prices,
    period: 14
  });

  return rsi[rsi.length - 1];
};

// MACD
export const calculateMACD = (prices) => {
  const macd = MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  });

  const latest = macd[macd.length - 1];

  return {
    macd: latest.MACD,
    signal: latest.signal
  };
};

// EMA 9 & 50
export const calculateEMA = (prices) => {

  const ema = (data, period) => {

    if (data.length < period) return null;

    const multiplier = 2 / (period + 1);

    let emaValue =
      data.slice(0, period)
        .reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < data.length; i++) {
      emaValue =
        (data[i] - emaValue) * multiplier +
        emaValue;
    }

    return Number(emaValue.toFixed(2));
  };

  return {
    ema9: ema(prices, 9),
    ema50: ema(prices, 50),
    ema200: ema(prices, 200)
  };
};
export const calculateSMA = (prices, period) => {
  if (prices.length < period) return null;

  const slice = prices.slice(-period);

  return (
    slice.reduce((sum, price) => sum + price, 0) / period
  );
};