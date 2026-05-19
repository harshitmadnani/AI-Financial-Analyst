import React from "react";
import ReactECharts from "echarts-for-react";

const CandlestickChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Transform API data
  const dates = data.map(d => d.date);
  const values = data.map(d => [
    d.open,
    d.close,
    d.low,
    d.high
  ]);
  const volumes = data.map(d => d.volume);

  // EMA calculation
  const calculateEMA = (period, prices) => {
    let k = 2 / (period + 1);
    let emaArray = [];
    let ema = prices[0];

    prices.forEach((price, i) => {
      ema = i === 0 ? price : price * k + ema * (1 - k);
      emaArray.push(ema.toFixed(2));
    });

    return emaArray;
  };

  const closePrices = data.map(d => d.close);
  const ema20 = calculateEMA(20, closePrices);

  const option = {
    backgroundColor: "transparent",

    tooltip: {
      trigger: "axis"
    },

    axisPointer: {
      link: [{ xAxisIndex: "all" }]
    },

    grid: [
      { left: "5%", right: "5%", height: "60%" },
      { left: "5%", right: "5%", top: "75%", height: "15%" }
    ],

    xAxis: [
      {
        type: "category",
        data: dates,
        scale: true,
        boundaryGap: false
      },
      {
        type: "category",
        gridIndex: 1,
        data: dates
      }
    ],

    yAxis: [
      { scale: true },
      { gridIndex: 1 }
    ],

    series: [
      {
        name: "Candlestick",
        type: "candlestick",
        data: values,
        itemStyle: {
          color: "#22c55e",     // green
          color0: "#ef4444",    // red
          borderColor: "#22c55e",
          borderColor0: "#ef4444"
        }
      },

      {
        name: "EMA 20",
        type: "line",
        data: ema20,
        smooth: true,
        lineStyle: {
          color: "#3b82f6",
          width: 2
        }
      },

      {
        name: "Volume",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: "#64748b"
        }
      }
    ]
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 400, width: "100%" }}
    />
  );
};

export default CandlestickChart;