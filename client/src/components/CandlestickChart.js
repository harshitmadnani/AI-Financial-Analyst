import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

export default function CandlestickChart({ data }) {
  const MAX_VISIBLE = 40;
  const visibleData = data.slice(-MAX_VISIBLE);

  // ✅ EMA FUNCTION
  const calculateEMA = (data, period) => {
    const prices = data.map(d => d.close);
    let k = 2 / (period + 1);
    let ema = [prices[0]];

    for (let i = 1; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }

    return ema;
  };
  const dates = data.map(d => {
  const dt = new Date(d.time);
  return `${dt.getHours()}:${dt.getMinutes().toString().padStart(2, "0")}`;
});

  // ✅ OPTION (HOOK ALWAYS FIRST)
  const option = useMemo(() => {
    if (!data || data.length === 0) return {};

    return {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" }
      },

  grid: [
  { left: "8%", right: "5%", height: "55%" },
  { left: "8%", right: "5%", top: "70%", height: "18%" }
],

      xAxis: [
        {
          type: "category",
          data: dates,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#888" } },
          axisLabel: {
            color: "#aaa",
            fontSize: 10,
            interval: Math.floor(data.length / 6) // 🔥 show fewer labels
          }
        },
        {
          type: "category",
          gridIndex: 1,
          data: data.map(d => d.time)
        }
      ],

    yAxis: [
  {
    scale: true,
    position: "right", // 🔥 move to right (clean like TradingView)
    
    axisLabel: {
      color: "#aaa",
      formatter: (value) => value.toFixed(0), // 🔥 removes decimals clutter
    },

    splitLine: {
      lineStyle: {
        color: "#1f2937", // subtle grid
        type: "dashed"
      }
    },

    axisLine: {
      show: false
    },

    axisTick: {
      show: false
    }
  },

  {
    gridIndex: 1,
    axisLabel: {
      show: false
    },
    splitLine: { show: false }
  }
],

     dataZoom: [
  {
    type: "inside",
    start: 100 - (MAX_VISIBLE / data.length) * 100,
    end: 100
  },
  {
    type: "slider",
    start: 100 - (MAX_VISIBLE / data.length) * 100,
    end: 100,
    height: 20
  }
],

      series: [
        {
          type: "candlestick",
          data: data.map(d => [d.open, d.close, d.low, d.high]),
          itemStyle: {
            color: "#22c55e",
            color0: "#ef4444",
            borderColor: "#22c55e",
            borderColor0: "#ef4444"
          }
        },

        {
          type: "line",
          data: calculateEMA(data, 20),
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: "#60a5fa" }
        },

        {
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: data.map(d => d.volume),
          itemStyle: {
            color: "#888"
          }
        }
      ]
    };
  }, [data]);

  // ✅ SAFE RENDER
  if (!data || data.length === 0) return null;

  return (
    <ReactECharts option={option} style={{ height: 400 }} />
  );
}