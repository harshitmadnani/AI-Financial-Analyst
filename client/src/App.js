import React, { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import StockDetails from "./components/StockDetails";
import QuickAnalyse from "./components/QuickAnalyse";
import Watchlist from "./components/Watchlist";
import Predictions from "./components/Predictions";
import TopMovers from "./components/TopMovers";
import RSIScreener from "./components/RSIScreener";

/* ✅ STOCK DATA */
const STOCKS = {
  Indices: ["^NSEI", "^NSEBANK"],

  LargeCap: [
    "RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS",
    "ICICIBANK.NS","SBIN.NS","LT.NS","HINDUNILVR.NS",
    "ITC.NS","KOTAKBANK.NS","AXISBANK.NS","BAJFINANCE.NS",
    "BHARTIARTL.NS","ASIANPAINT.NS","MARUTI.NS","SUNPHARMA.NS",
    "TITAN.NS","ULTRACEMCO.NS","NESTLEIND.NS","WIPRO.NS",
    "NTPC.NS","POWERGRID.NS","JSWSTEEL.NS","TATASTEEL.NS",
    "ONGC.NS","HCLTECH.NS","TECHM.NS","ADANIENT.NS",
    "ADANIPORTS.NS","INDUSINDBK.NS","BAJAJFINSV.NS",
    "DRREDDY.NS","CIPLA.NS","DIVISLAB.NS","EICHERMOT.NS",
    "HEROMOTOCO.NS","GRASIM.NS","SHREECEM.NS","BRITANNIA.NS",
    "COALINDIA.NS","BPCL.NS","IOC.NS","UPL.NS",
    "DMART.NS","PIDILITIND.NS","DABUR.NS","GODREJCP.NS",
    "ICICIPRULI.NS","ICICIGI.NS","HDFCLIFE.NS","SBILIFE.NS",
    "NAUKRI.NS","ZOMATO.NS","PAYTM.NS","IRCTC.NS",
    "BAJAJHLDNG.NS","TORNTPHARM.NS","MCDOWELL-N.NS",
    "SIEMENS.NS","ABB.NS","HAVELLS.NS","BERGEPAINT.NS"
  ],

  MidCap: [
    "LTIM.NS","MPHASIS.NS","COFORGE.NS","PERSISTENT.NS",
    "CHOLAFIN.NS","LTF.NS","MUTHOOTFIN.NS","FEDERALBNK.NS",
    "IDFCFIRSTB.NS","BANDHANBNK.NS",
    "ALKEM.NS","LUPIN.NS","AUROPHARMA.NS","BIOCON.NS",
    "POLYCAB.NS","KEI.NS","APLAPOLLO.NS","ASHOKLEY.NS",
    "ESCORTS.NS","CUMMINSIND.NS",
    "TRENT.NS","PAGEIND.NS","NYKAA.NS","RELAXO.NS",
    "DEEPAKNTR.NS","NAVINFLUOR.NS","SRF.NS",
    "INDIAMART.NS","IRFC.NS","RVNL.NS","BSE.NS","CDSL.NS"
  ],

  SmallCap: [
    "IRCTC.NS","CDSL.NS","BSE.NS",
    "TANLA.NS","KPRMILL.NS","AFFLE.NS",
    "IEX.NS","EASEMYTRIP.NS","RITES.NS"
  ]
};

const ALL_STOCKS = Object.values(STOCKS).flat();

export default function Dashboard() {

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockMap, setStockMap] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [topMovers, setTopMovers] = useState({ gainers: [], losers: [] });
  const [rsiData, setRsiData] = useState({ oversold: [], overbought: [] });

  const format = (num) => Number(num || 0).toFixed(2);

  /* ✅ FETCH STOCK */
  const fetchStock = async (symbol) => {
    try {
      const res = await axios.get(`http://localhost:5000/stock/${symbol}`);

      setStockMap((prev) => ({
        ...prev,
        [symbol]: res.data
      }));

    } catch (err) {
      console.error("Stock fetch error:", symbol);
    }
  };

  /* ✅ TOP MOVERS */
  const fetchTopMovers = async () => {
    try {
      const res = await fetch("http://localhost:5000/stock/top-movers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: ALL_STOCKS })
      });

      const data = await res.json();
      setTopMovers(data);

    } catch (err) {
      console.error("Top movers error:", err);
    }
  };

  /* ✅ SELECT STOCK */
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    fetchStock(stock);
    setQuery("");
    setSuggestions([]);
  };

  /* ✅ WATCHLIST */
  const addToWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) return;

    const updated = [...watchlist, symbol];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));

    fetchStock(symbol);
  };

const fetchRSIScreener = async () => {
  try {
    const res = await fetch("http://localhost:5000/stock/rsi-screener", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ symbols: ALL_STOCKS })
    });

    const data = await res.json();
    setRsiData(data);

  } catch (err) {
    console.error("RSI screener error:", err);
  }
};

useEffect(() => {
  fetchRSIScreener();

  const interval = setInterval(fetchRSIScreener, 600000); // 10 min

  return () => clearInterval(interval);
}, []);


  const removeFromWatchlist = (symbol) => {
    const updated = watchlist.filter((s) => s !== symbol);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  const handleWatchlistClick = (symbol) => {
    setSelectedStock(symbol);
    fetchStock(symbol);
  };

  /* ✅ LOAD WATCHLIST */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("watchlist")) || [];
    setWatchlist(saved);
    saved.forEach(fetchStock);
  }, []);

  /* ✅ DEFAULT STOCK */
  useEffect(() => {
    if (!selectedStock) {
      setSelectedStock("RELIANCE.NS");
      fetchStock("RELIANCE.NS");
    }
  }, []);

  /* 🔥 STOCK REFRESH → EVERY 20 SEC */
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedStock) fetchStock(selectedStock);
    }, 20000); // ✅ 20 seconds

    return () => clearInterval(interval);
  }, [selectedStock]);

  /* 🔥 WATCHLIST REFRESH → EVERY 40 SEC */
  useEffect(() => {
    const interval = setInterval(() => {
      watchlist.forEach(fetchStock);
    }, 40000);

    return () => clearInterval(interval);
  }, [watchlist]);

  /* 🔥 TOP MOVERS → EVERY 5 MIN */
  useEffect(() => {
    fetchTopMovers();

    const interval = setInterval(fetchTopMovers, 300000);

    return () => clearInterval(interval);
  }, []);

  /* 🔥 PREDICTIONS → EVERY 10 MIN */
  useEffect(() => {
    const loadPredictions = () => {
      axios.get("http://localhost:5000/predictions")
        .then(res => setPredictions(res.data))
        .catch(() => {});
    };

    loadPredictions();

    const interval = setInterval(loadPredictions, 600000);

    return () => clearInterval(interval);
  }, []);

  /* 🔍 SEARCH */
  useEffect(() => {
    if (!query) return setSuggestions([]);

    const filtered = ALL_STOCKS.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
  }, [query]);

  const selectedStockData = selectedStock
    ? stockMap[selectedStock]
    : null;

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <Navbar watchlistCount={watchlist.length} />

      <SearchBar
        query={query}
        setQuery={setQuery}
        suggestions={suggestions}
        handleSelectStock={handleSelectStock}
      />

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="col-span-2">
          <StockDetails
            stock={selectedStockData}
            symbol={selectedStock}
            format={format}
            addToWatchlist={addToWatchlist}
            fetchStock={fetchStock}
          />

          <TopMovers
            gainers={topMovers.gainers}
            losers={topMovers.losers}
            format={format}
          />
          <RSIScreener data={rsiData} />
        </div>

        {/* RIGHT */}
        <div className="space-y-4 sticky top-6 h-[calc(100vh-100px)] overflow-y-auto">

          <QuickAnalyse
            STOCKS={STOCKS}
            handleSelectStock={handleSelectStock}
          />

          <Watchlist
            watchlist={watchlist}
            stockMap={stockMap}
            format={format}
            handleClick={handleWatchlistClick}
            removeFromWatchlist={removeFromWatchlist}
          />

          <Predictions predictions={predictions} />

        </div>

      </div>
    </div>
  );
}