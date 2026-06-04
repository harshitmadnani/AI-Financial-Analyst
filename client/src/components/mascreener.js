import { useEffect, useState } from "react";

export default function MAScreener({
  data,
  handleSelectStock
}) {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setStocks(data);
    }
  }, [data]);

  return (
    <div className="bg-gray-900 p-5 rounded-2xl mt-6">
      <h3 className="mb-4 font-semibold text-gray-200">
        MA200 Screener (1 Hour)
      </h3>

      {stocks.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No stocks near MA200
        </p>
      ) : (
        <div className="space-y-3">
          {stocks.map((stock) => {
            const nearMA =
              Math.abs(stock.distanceFrom200) <= 2;

            return (
              <div
                key={stock.symbol}
                onClick={() =>
                  handleSelectStock?.(stock.symbol)
                }
                className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all hover:bg-gray-700
                  ${
                    nearMA
                      ? "bg-blue-900 border border-blue-500"
                      : "bg-gray-800"
                  }`}
              >
                <div>
                  <div className="font-medium text-white">
                    {stock.symbol.replace(".NS", "")}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    Price: ₹{stock.price}
                  </div>

                  <div className="text-xs text-gray-400">
                    MA200: ₹{stock.ma200}
                  </div>

                  <div className="text-xs text-gray-500">
                    Gap: {stock.distanceFrom200}%
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      stock.distanceFrom200 < 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {stock.distanceFrom200 > 0 ? "+" : ""}
                    {stock.distanceFrom200}%
                  </div>

                  <div
                    className={`mt-1 px-2 py-1 rounded text-xs font-medium inline-block
                      ${
                        stock.signal ===
                        "APPROACHING_FROM_BELOW"
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-green-900 text-green-300"
                      }`}
                  >
                    {stock.signal ===
                    "APPROACHING_FROM_BELOW"
                      ? "Approaching MA200 ↑"
                      : "Above MA200 ↓"}
                  </div>

                  {nearMA && (
                    <div className="text-blue-400 text-xs mt-2 font-semibold">
                      🎯 Near MA200
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}