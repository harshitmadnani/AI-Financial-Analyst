import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export const getStockData = async (symbol, config) => {
  try {
    console.log("Fetching symbol:", symbol);
    console.log("Config:", config);

    const now = Math.floor(Date.now() / 1000);

    // 🔥 Convert range → seconds
    const rangeMap = {
      "1d": 1 * 24 * 60 * 60,
      "5d": 5 * 24 * 60 * 60,
      "1mo": 30 * 24 * 60 * 60,
      "1y": 365 * 24 * 60 * 60
    };

    const period2 = now;
    const period1 = now - (rangeMap[config.range] || rangeMap["1d"]);

    const result = await yahooFinance.chart(symbol, {
      period1,
      period2,
      interval: config.interval
    });

    console.log("YAHOO RAW:", result);
    console.log("QUOTES LENGTH:", result?.quotes?.length);

    // ✅ SAFE ACCESS
    const quote = result?.quotes || [];

    // 🚨 HARD FAIL (NO FAKE DATA)
    if (!quote || quote.length === 0) {
      throw new Error(`No market data for ${symbol}`);
    }

    // 🔥 Clean OHLC structure
    const history = quote.map(q => ({
      time: new Date(q.date).toISOString(),
      open: q.open ?? 0,
      high: q.high ?? 0,
      low: q.low ?? 0,
      close: q.close ?? 0,
      volume: q.volume ?? 0
    }));

    // 🔥 Extract close prices for RSI
    const prices = history.map(h => h.close).filter(Boolean);

    // 🚨 EXTRA SAFETY
    if (prices.length === 0) {
      throw new Error(`Invalid price data for ${symbol}`);
    }

    return { history, prices };

  } catch (err) {
    console.error("YAHOO ERROR:", err.message);

    // ❌ DO NOT silently fallback — send error up
    throw new Error(`Fetch failed for ${symbol}`);
  }
};