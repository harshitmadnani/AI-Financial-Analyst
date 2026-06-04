import { useEffect, useState } from "react";

export default function RSIScreener({ data }) {
  const [rsiData, setRsiData] = useState({});

  useEffect(() => {
    if (data) {
      setRsiData(data);
    }
  }, [data]);

  const renderBlock = (title, tfKey, valueKey) => {
    const tfData = rsiData?.[tfKey] || {};

    return (
      <div className="mb-6">
        <h4 className="text-sm text-gray-400 mb-3">{title}</h4>

        <div className="grid grid-cols-2 gap-6">

          {/* Oversold */}
          <div>
            <p className="text-green-400 text-xs mb-2">Oversold (20–30)</p>

            {tfData?.oversold?.length === 0 && (
              <p className="text-gray-500 text-xs">No stocks</p>
            )}

            {tfData?.oversold?.map((s) => (
              <div key={s.symbol} className="flex justify-between text-sm">
                <span>{s.symbol.replace(".NS", "")}</span>
                <span className="text-green-400">{s[valueKey]}</span>
              </div>
            ))}
          </div>

          {/* Overbought */}
          <div>
            <p className="text-red-400 text-xs mb-2">Overbought (70–80)</p>

            {tfData?.overbought?.length === 0 && (
              <p className="text-gray-500 text-xs">No stocks</p>
            )}

            {tfData?.overbought?.map((s) => (
              <div key={s.symbol} className="flex justify-between text-sm">
                <span>{s.symbol.replace(".NS", "")}</span>
                <span className="text-red-400">{s[valueKey]}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-5 rounded-2xl mt-6">
      <h3 className="mb-4 font-semibold text-gray-200">
        RSI Screener
      </h3>

      {renderBlock("15 Min", "fifteenMin", "rsi15m")}
      {renderBlock("30 Min", "thirtyMin", "rsi30m")}
      {renderBlock("1 Hour", "oneHour", "rsi1h")}
    </div>
  );
}