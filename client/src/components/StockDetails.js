import { useState, useEffect, useRef } from "react";
import CandlestickChart from "./CandlestickChart";

export default function StockDetails({
  stock,
  symbol,
  format,
  addToWatchlist,
  fetchStock
}) {
  const [timeframe, setTimeframe] = useState("1D");

  // 🔥 Track previous price for change %
  const prevPriceRef = useRef(null);
  const [priceChange, setPriceChange] = useState(0);
  const [blink, setBlink] = useState("");

  useEffect(() => {
    if (!stock?.price) return;

    if (prevPriceRef.current !== null) {
      const change =
        ((stock.price - prevPriceRef.current) / prevPriceRef.current) * 100;

      setPriceChange(change);

      // 🔥 Blink effect
      if (change > 0) {
        setBlink("text-green-400");
      } else if (change < 0) {
        setBlink("text-red-400");
      }

      setTimeout(() => setBlink(""), 500);
    }

    prevPriceRef.current = stock.price;
  }, [stock?.price]);

  if (!stock) {
    return <div className="bg-gray-900 h-48 rounded-2xl animate-pulse" />;
  }

  const handleTimeframe = (tf) => {
    setTimeframe(tf);
    fetchStock(symbol, tf);
  };

  // 🔥 RSI TREND LOGIC
  const getRSITrend = (value) => {
    if (value < 30) return "↑"; // bullish reversal
    if (value > 70) return "↓"; // bearish
    return "→"; // neutral
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">

        {/* LEFT */}
        <div>
          <h2 className="text-xl font-semibold">{symbol}</h2>
          <p className="text-xs text-gray-400">NSE</p>
        </div>

        {/* RIGHT RSI */}
        {stock?.rsiMap && (
          <div className="text-right">
            <p className="text-[10px] text-gray-400 mb-1">
              RSI (Multi TF)
            </p>

            <div className="flex flex-wrap gap-2 justify-end">

              {Object.entries(stock.rsiMap).map(([tf, value]) => {
                const trend = getRSITrend(value);

                const bg =
                  value < 30
                    ? "bg-green-500/10 border-green-500/30"
                    : value > 70
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30";

                const text =
                  value < 30
                    ? "text-green-400"
                    : value > 70
                    ? "text-red-400"
                    : "text-yellow-400";

                return (
                  <div
                    key={tf}
                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${bg}`}
                  >
                    <span className="text-[9px] text-gray-400 uppercase">
                      {tf}
                    </span>

                    <span className={`text-sm font-semibold ${text}`}>
                      {value}
                    </span>

                    {/* 🔥 TREND ARROW */}
                    <span className="text-xs">{trend}</span>
                  </div>
                );
              })}

            </div>
          </div>
        )}
      </div>

      {/* PRICE + % CHANGE */}
      <div className="flex items-end gap-3">
        <p className={`text-3xl font-bold transition ${blink}`}>
          ₹ {format(stock.price)}
        </p>

        <span
          className={`text-sm font-medium ${
            priceChange > 0
              ? "text-green-400"
              : priceChange < 0
              ? "text-red-400"
              : "text-gray-400"
          }`}
        >
          {priceChange > 0 ? "+" : ""}
          {priceChange.toFixed(2)}%
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        RSI: {format(stock.rsi)}
      </p>

      {/* TIMEFRAME */}
    

      {/* CHART */}
      {stock.history && stock.history.length > 0 && (
        <CandlestickChart data={stock.history} />
      )}

      {/* TRADE */}
      <div className="grid grid-cols-3 gap-4 text-sm mt-4">
        <div>
          <p className="text-gray-500">Entry</p>
          <p>₹ {format(stock.entry)}</p>
        </div>
        <div>
          <p className="text-gray-500">SL</p>
          <p className="text-red-400">
            ₹ {format(stock.stopLoss)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Target</p>
          <p className="text-green-400">
            ₹ {format(stock.target)}
          </p>
        </div>
      </div>

      {/* ANALYSIS */}
      <p className="mt-4 text-sm text-gray-300 leading-relaxed">
        {stock.analysis}
      </p>

      {/* ACTION */}
      <button
        onClick={() => addToWatchlist(symbol)}
        className="mt-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition"
      >
        + Add to Watchlist
      </button>
    </div>
  );
}