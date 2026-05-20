import { useState } from "react";
import CandlestickChart from "./CandlestickChart";

export default function StockDetails({
  stock,
  symbol,
  format,
  addToWatchlist,
  fetchStock // 🔥 pass this from parent
}) {
  const [timeframe, setTimeframe] = useState("1D");

  if (!stock) {
    return <div className="bg-gray-900 h-48 rounded-2xl animate-pulse" />;
  }

  const handleTimeframe = (tf) => {
    setTimeframe(tf);
    fetchStock(symbol, tf); // 🔥 API call with timeframe
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{symbol}</h2>
        <span className="text-sm text-gray-400">NSE</span>
      </div>

      {/* PRICE */}
      <p className="text-3xl font-bold">
        ₹ {format(stock.price)}
      </p>

      <p className="text-sm text-gray-400 mb-4">
        RSI: {format(stock.rsi)}
      </p>

      {/* 🔥 TIMEFRAME SWITCH */}
      <div className="flex gap-2 mb-4">
        {["1D", "1W", "1M", "1Y"].map((tf) => (
          <button
            key={tf}
            onClick={() => handleTimeframe(tf)}
            className={`px-3 py-1 rounded text-sm transition ${
              timeframe === tf
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* 🔥 CHART */}
      {stock.history && (
        <CandlestickChart data={stock.history} />
      )}

      {/* 🔥 TRADE GRID */}
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