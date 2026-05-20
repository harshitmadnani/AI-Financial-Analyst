
import React, { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import StockDetails from "./components/StockDetails";
import QuickAnalyse from "./components/QuickAnalyse";
import Watchlist from "./components/Watchlist";
import Predictions from "./components/Predictions";
import TopMovers from "./components/TopMovers";

/* ✅ STOCK DATA */
const STOCKS = {
  LargeCap: [
    "RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS",
    "ICICIBANK.NS","SBIN.NS","LT.NS","HINDUNILVR.NS",
    "ITC.NS","KOTAKBANK.NS"
  ],
  MidCap: ["LTIM.NS","MPHASIS.NS","COFORGE.NS"],
  SmallCap: ["IRCTC.NS","CDSL.NS","BSE.NS"]
};

const ALL_STOCKS = Object.values(STOCKS).flat();

export default function Dashboard() {

  /* ✅ STATE */
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockMap, setStockMap] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [topMovers, setTopMovers] = useState({ gainers: [], losers: [] });

  const selectedStockData = selectedStock
    ? stockMap[selectedStock]
    : null;

  /* ✅ FORMAT */
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
      console.error("Fetch error:", symbol);
    }
  };

  const fetchTopMovers = async () => {
  try {
    const res = await fetch("http://localhost:5000/top-movers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols: STOCKS }) // ⚠️ make sure STOCKS is array
    });

    const data = await res.json();
    setTopMovers(data);

  } catch (err) {
    console.error("Top Movers Error:", err);
  }
};

  /* ✅ SELECT STOCK */
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    fetchStock(stock);
    setQuery("");          // clear input
    setSuggestions([]);    // hide dropdown
  };

  /* ✅ WATCHLIST CLICK */
  const handleWatchlistClick = (symbol) => {
    setSelectedStock(symbol);
    fetchStock(symbol);
  };

  /* ✅ ADD WATCHLIST */
  const addToWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) return;

    const updated = [...watchlist, symbol];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));

    fetchStock(symbol);
  };

  /* ✅ REMOVE WATCHLIST */
  const removeFromWatchlist = (symbol) => {
    const updated = watchlist.filter((s) => s !== symbol);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  /* ✅ LOAD WATCHLIST */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("watchlist")) || [];
    setWatchlist(saved);
    saved.forEach(fetchStock);
  }, []);

  /* ✅ AUTO SELECT DEFAULT STOCK */
  useEffect(() => {
    if (!selectedStock) {
      const defaultStock = "RELIANCE.NS";
      setSelectedStock(defaultStock);
      fetchStock(defaultStock);
    }
  }, []);
  useEffect(() => {
  fetchTopMovers();
}, []);

useEffect(() => {
  fetchTopMovers();

  const interval = setInterval(fetchTopMovers, 600000); // every 1 min

  return () => clearInterval(interval);
}, []);

  /* ✅ PRICE REFRESH (10 sec) */
  useEffect(() => {
    const interval = setInterval(() => {
      watchlist.forEach(fetchStock);
      if (selectedStock) fetchStock(selectedStock);
    }, 10000);

    return () => clearInterval(interval);
  }, [watchlist, selectedStock]);

  /* ✅ PREDICTIONS LOAD */
  useEffect(() => {
    axios.get("http://localhost:5000/predictions")
      .then(res => setPredictions(res.data))
      .catch(err => console.error(err));
  }, []);

  /* ✅ RSI + AI REFRESH (10 min) */
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedStock) fetchStock(selectedStock);

      axios.get("http://localhost:5000/predictions")
        .then(res => setPredictions(res.data))
        .catch(err => console.error(err));

    }, 600000);

    return () => clearInterval(interval);
  }, [selectedStock]);

  /* ✅ SEARCH FILTER */
  useEffect(() => {
    if (!query) return setSuggestions([]);

    const filtered = ALL_STOCKS.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
  }, [query]);

  /* ✅ UI */
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

              {/* LEFT PANEL */}
        <div className="col-span-2">
        <StockDetails
        stock={selectedStockData}
        symbol={selectedStock}
        format={format}
        addToWatchlist={addToWatchlist}
        fetchStock={fetchStock} // 🔥 REQUIRED
      />

         <TopMovers
          gainers={topMovers.gainers}
          losers={topMovers.losers}
          format={format}
        />
        </div>

        {/* RIGHT PANEL */}
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