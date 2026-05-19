export default function QuickAnalyse({ STOCKS, handleSelectStock }) {
  return (
    <div className="bg-gray-900 p-4 rounded-2xl">
      <h3 className="text-sm text-gray-400 mb-3">Quick Analyse</h3>

      {Object.entries(STOCKS).map(([category, stocks]) => (
        <div key={category} className="mb-4">
          <p className="text-xs text-gray-500 mb-2">{category}</p>

          <div className="flex flex-wrap gap-2">
            {stocks.map((stock) => (
              <button
                key={stock}
                onClick={() => handleSelectStock(stock)}
                className="px-3 py-1 bg-gray-800 rounded-full text-xs"
              >
                {stock.replace(".NS", "")}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}