export default function TopMovers({
  gainers = [],
  losers = [],
  format,
  handleSelectStock // ✅ NEW PROP
}) {

  // ✅ SAFE FORMAT FALLBACK
  const safeFormat = (num) => {
    if (format) return format(num);
    return Number(num || 0).toFixed(2);
  };

  console.log(gainers, losers, "TopMovers Data");

  return (
    <div className="bg-gray-900 p-5 rounded-2xl">

      <h3 className="mb-4 font-semibold text-gray-200">
        Top Movers (Today)
      </h3>

      {/* EMPTY STATE */}
      {gainers.length === 0 && losers.length === 0 && (
        <p className="text-gray-400 text-sm">Loading market movers...</p>
      )}

      <div className="grid grid-cols-2 gap-6">

        {/* ✅ GAINERS */}
        <div>
          <p className="text-green-400 text-xs mb-3 uppercase tracking-wide">
            Top Gainers
          </p>

          {gainers.map((s) => (
            <div
              key={s.symbol}
              onClick={() => {
                console.log("Gainer clicked:", s.symbol); // 🔥 DEBUG
                handleSelectStock && handleSelectStock(s.symbol);
              }}
              className="flex justify-between items-center mb-2 text-sm cursor-pointer hover:bg-gray-800 p-2 rounded transition"
            >
              <span className="text-gray-300">
                {s.symbol.replace(".NS", "")}
              </span>

              <div className="text-right min-w-[90px]">
                <p className="text-gray-200">
                  ₹ {safeFormat(s.price)}
                </p>

                <p className="text-green-400 text-xs font-medium">
                  +{Math.abs(s.changePercent).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ❌ LOSERS */}
        <div>
          <p className="text-red-400 text-xs mb-3 uppercase tracking-wide">
            Top Losers
          </p>

          {losers.map((s) => (
            <div
              key={s.symbol}
              onClick={() => {
                console.log("Loser clicked:", s.symbol); // 🔥 DEBUG
                handleSelectStock && handleSelectStock(s.symbol);
              }}
              className="flex justify-between items-center mb-2 text-sm cursor-pointer hover:bg-gray-800 p-2 rounded transition"
            >
              <span className="text-gray-300">
                {s.symbol.replace(".NS", "")}
              </span>

              <div className="text-right min-w-[90px]">
                <p className="text-gray-200">
                  ₹ {safeFormat(s.price)}
                </p>

                <p className="text-red-400 text-xs font-medium">
                  -{Math.abs(s.changePercent).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}