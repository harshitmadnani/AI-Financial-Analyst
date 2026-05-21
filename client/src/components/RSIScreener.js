import { useEffect, useState } from "react";

export default function RSIScreener({ data }) {
  const [rsiData, setRsiData] = useState({
    oneHour: { oversold: [], overbought: [] },
    fifteenMin: { oversold: [], overbought: [] }
  });

  useEffect(() => {
    if (data) {
      console.log("RSI DATA:", data); // 🔍 DEBUG
      setRsiData(data);
    }
  }, [data]);

  return (
    <div className="bg-gray-900 p-5 rounded-2xl mt-6">

      <h3 className="mb-4 font-semibold text-gray-200">
        RSI Screener
      </h3>

      {/* ================= 1 HOUR ================= */}
      <div className="mb-6">
        <h4 className="text-sm text-gray-400 mb-3">1 Hour</h4>

        <div className="grid grid-cols-2 gap-6">

          {/* ✅ OVERSOLD */}
          <div>
            <p className="text-green-400 text-xs mb-2">
              Oversold (20–30)
            </p>

            {rsiData.oneHour.oversold.length === 0 && (
              <p className="text-gray-500 text-xs">No stocks</p>
            )}

            {rsiData.oneHour.oversold.map((s) => (
              <div
                key={s.symbol}
                className="flex justify-between text-sm mb-1"
              >
                <span>{s.symbol.replace(".NS", "")}</span>
                <span className="text-green-400">
                  {s.rsi1h}
                </span>
              </div>
            ))}
          </div>

          {/* ✅ OVERBOUGHT */}
          <div>
            <p className="text-red-400 text-xs mb-2">
              Overbought (70–80)
            </p>

            {rsiData.oneHour.overbought.length === 0 && (
              <p className="text-gray-500 text-xs">No stocks</p>
            )}

            {rsiData.oneHour.overbought.map((s) => (
              <div
                key={s.symbol}
                className="flex justify-between text-sm mb-1"
              >
                <span>{s.symbol.replace(".NS", "")}</span>
                <span className="text-red-400">
                  {s.rsi1h}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ================= 15 MIN ================= */}
      <div>
        <h4 className="text-sm text-gray-400 mb-3">15 Min</h4>

        <div className="grid grid-cols-2 gap-6">

          {/* ✅ OVERSOLD */}
          <div>
            <p className="text-green-400 text-xs mb-2">
              Oversold (20–30)
            </p>

            {rsiData.fifteenMin.oversold.length === 0 && (
              <p className="text-gray-500 text-xs">No stocks</p>
            )}

            {rsiData.fifteenMin.oversold.map((s) => (
              <div
                key={s.symbol}
                className="flex justify-between text-sm mb-1"
              >
                <span>{s.symbol.replace(".NS", "")}</span>
                <span className="text-green-400">
                  {s.rsi15m}
                </span>
              </div>
            ))}
          </div>

          {/* ✅ OVERBOUGHT */}
          <div>
            <p className="text-red-400 text-xs mb-2">
              Overbought (70–80)
            </p>

            {rsiData.fifteenMin.overbought.length === 0 && (
              <p className="text-gray-500 text-xs">No stocks</p>
            )}

            {rsiData.fifteenMin.overbought.map((s) => (
              <div
                key={s.symbol}
                className="flex justify-between text-sm mb-1"
              >
                <span>{s.symbol.replace(".NS", "")}</span>
                <span className="text-red-400">
                  {s.rsi15m}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}