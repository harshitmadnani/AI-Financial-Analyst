import { useState, useEffect } from "react";

export default function RSIScreener({ data }) {
  const [tab, setTab] = useState("oversold");

  useEffect(() => {
    console.log("RSI DATA:", data);
  }, [data]);

  const list = tab === "oversold" ? data.oversold : data.overbought;

  return (
    <div className="bg-gray-900 p-5 rounded-2xl mt-4">

      <h3 className="text-sm text-gray-400 mb-3">
        RSI Screener (1H)
      </h3>

      {/* TABS */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("oversold")}
          className={`px-3 py-1 rounded text-xs ${
            tab === "oversold"
              ? "bg-green-600"
              : "bg-gray-800"
          }`}
        >
          Oversold
        </button>

        <button
          onClick={() => setTab("overbought")}
          className={`px-3 py-1 rounded text-xs ${
            tab === "overbought"
              ? "bg-red-600"
              : "bg-gray-800"
          }`}
        >
          Overbought
        </button>
      </div>

      {/* LIST */}
      {list.length === 0 ? (
        <p className="text-gray-500 text-xs">
          No data available
        </p>
      ) : (
        list.map((s) => (
          <div
            key={s.symbol}
            className="flex justify-between text-sm mb-2"
          >
            <span>{s.symbol.replace(".NS", "")}</span>

            <span
              className={
                tab === "oversold"
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {s.rsi}
            </span>
          </div>
        ))
      )}
    </div>
  );
}