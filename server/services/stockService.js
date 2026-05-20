import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export const getStockData = async (symbol, config) => {
  try {
    const now = Math.floor(Date.now() / 1000);

    // 🔥 Range → seconds
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

    const quote = result?.quotes || [];

    // 🚨 HARD FAIL (GOOD PRACTICE)
    if (!quote.length) {
      throw new Error(`No market data for ${symbol}`);
    }

    // ✅ CLEAN HISTORY (NO META HERE)
    const history = quote.map(q => ({
      time: new Date(q.date).toISOString(),
      open: Number(q.open ?? 0),
      high: Number(q.high ?? 0),
      low: Number(q.low ?? 0),
      close: Number(q.close ?? 0),
      volume: Number(q.volume ?? 0)
    }));

    // ✅ CLOSE PRICES FOR RSI
    const prices = history.map(h => h.close).filter(p => p > 0);

    if (!prices.length) {
      throw new Error(`Invalid price data for ${symbol}`);
    }

    // ✅ RETURN META SEPARATELY (IMPORTANT)
    return {
      history,
      prices,
      meta: result.meta || {}
    };

  } catch (err) {
    throw new Error(`Fetch failed for ${symbol}`);
  }
};

// 🔥 NEW FUNCTION (REAL MARKET DATA)
export const getStockQuote = async (symbol) => {
  try {
    const quote = await yahooFinance.quote(symbol);

    return {
      symbol,
      price: quote.regularMarketPrice,
      prevClose: quote.regularMarketPreviousClose,
      changePercent: quote.regularMarketChangePercent
    };

  } catch (err) {
    console.error("QUOTE ERROR:", symbol);
    return null;
  }
};