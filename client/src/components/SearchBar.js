export default function SearchBar({
  query,
  setQuery,
  suggestions,
  handleSelectStock
}) {
  return (
    <div className="relative max-w-xl mx-auto mb-10">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stocks..."
        className="w-full bg-gray-800 px-5 py-3 rounded-2xl border border-gray-700 focus:border-blue-500"
      />

      {suggestions.length > 0 && (
        <div className="absolute w-full bg-gray-900 mt-2 rounded-xl z-50 max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <div
              key={s}
              onClick={() => handleSelectStock(s)}
              className="px-4 py-3 hover:bg-gray-800 cursor-pointer"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}