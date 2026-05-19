import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export const getStockData = async (symbol) => {
  try {
    console.log("Fetching symbol:", symbol);

    const result = await yahooFinance.chart(symbol, {
      period1: "2024-01-01",
      period2: new Date(),
      interval: "1d"
    });

    if (!result || !result.quotes || result.quotes.length === 0) {
      throw new Error("No Yahoo data");
    }

    const prices = result.quotes
      .map(q => q.close)
      .filter(v => v !== null && v !== undefined);

    return prices;

  } catch (error) {
    console.log("YAHOO ERROR:", error);
    throw new Error("Yahoo Finance fetch failed");
  }
};