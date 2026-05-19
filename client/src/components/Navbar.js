export default function Navbar({ watchlistCount }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-semibold">AI Financial Analyst</h1>

      <div className="flex gap-6 text-sm">
        <span>Markets Open</span>
        <span className="text-yellow-400">Uncertain Sentiment</span>
        <span className="bg-blue-600 px-3 py-1 rounded-full">
          Watchlist ({watchlistCount})
        </span>
      </div>
    </div>
  );
}