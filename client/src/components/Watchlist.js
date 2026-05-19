export default function Watchlist({
  watchlist,
  stockMap,
  format,
  handleClick,
  removeFromWatchlist
}) {
  return (
    <div className="bg-gray-900 p-4 rounded-2xl">
      <h3 className="mb-3">Your Watchlist</h3>

      {watchlist.map((symbol) => {
        const stock = stockMap[symbol];

        return (
          <div
            key={symbol}
            onClick={() => handleClick(symbol)}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 mb-3 px-2 py-2 hover:bg-gray-800 cursor-pointer rounded-lg"
          >
            <div>
              <p className="text-sm">{symbol}</p>
              <p className="text-xs text-gray-500">NSE</p>
            </div>

            <div className="text-right min-w-[100px] tabular-nums">
              ₹ {stock ? format(stock.price) : "--"}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromWatchlist(symbol);
              }}
              className="text-red-400 text-xs"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}