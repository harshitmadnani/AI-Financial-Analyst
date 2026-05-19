
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
  const ema9 = EMA.calculate({
    values: prices,
    period: 9
  });

  const ema50 = EMA.calculate({
    values: prices,
    period: 50
  });

  return {
    ema9: ema9[ema9.length - 1],
    ema50: ema50[ema50.length - 1]
  };
};