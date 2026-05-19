export default function Predictions({ predictions }) {
  return (
    <div className="bg-gray-900 p-4 rounded-2xl">
      <h3 className="mb-4 font-semibold">📊 Market Predictions</h3>

      {predictions.map((p, i) => (
        <div key={i} className="mb-4">

          <p className="text-sm mb-2">{p.question}</p>

          {p.options.map((opt, j) => (
            <div key={j} className="mb-2">

              <div className="flex justify-between text-xs">
                <span>{opt.label}</span>
                <span>{opt.probability}%</span>
              </div>

              <div className="bg-gray-800 h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${opt.probability}%` }}
                />
              </div>

            </div>
          ))}

        </div>
      ))}
    </div>
  );
}