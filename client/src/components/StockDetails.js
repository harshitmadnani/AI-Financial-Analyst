import CandlestickChart from "./CandlestickChart";

export default function StockDetails({
  stock,
  symbol,
  format,
  addToWatchlist
}) {
  if (!stock) {
    return <div className="bg-gray-900 h-48 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl">

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">{symbol}</h2>
        <span className="text-sm text-gray-400">NSE</span>
      </div>

      <p className="text-3xl font-bold">
        ₹ {format(stock.price)}
      </p>

      <p className="text-sm text-gray-400 mb-4">
        RSI: {format(stock.rsi)}
      </p>

      {/* 🔥 Chart */}
      {stock.history && (
        <CandlestickChart data={stock.history} />
      )}

      {/* Trade */}
      <div className="grid grid-cols-3 gap-4 text-sm mt-4">
        <div>
          <p className="text-gray-500">Entry</p>
          <p>₹ {format(stock.entry)}</p>
        </div>
        <div>
          <p className="text-gray-500">SL</p>
          <p className="text-red-400">₹ {format(stock.stopLoss)}</p>
        </div>
        <div>
          <p className="text-gray-500">Target</p>
          <p className="text-green-400">₹ {format(stock.target)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-300">
        {stock.analysis}
      </p>

      <button
        onClick={() => addToWatchlist(symbol)}
        className="mt-4 bg-blue-600 px-4 py-2 rounded-xl"
      >
        + Add to Watchlist
      </button>
    </div>
  );
}