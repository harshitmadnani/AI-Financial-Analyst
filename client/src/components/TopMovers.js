export default function TopMovers({ gainers, losers, format }) {
  return (
    <div className="bg-gray-900 p-4 rounded-2xl">

      <h3 className="mb-3 font-semibold">Top Movers</h3>

      {/* Gainers */}
      <div className="mb-4">
        <p className="text-green-400 text-sm mb-2">Top Gainers</p>

        {gainers.map((s) => (
          <div key={s.symbol} className="flex justify-between text-sm mb-1">
            <span>{s.symbol.replace(".NS", "")}</span>
            <span className="text-green-400">
              +{s.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Losers */}
      <div>
        <p className="text-red-400 text-sm mb-2">Top Losers</p>

        {losers.map((s) => (
          <div key={s.symbol} className="flex justify-between text-sm mb-1">
            <span>{s.symbol.replace(".NS", "")}</span>
            <span className="text-red-400">
              {s.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}