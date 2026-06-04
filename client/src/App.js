
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
import MAScreener from "./components/mascreener";

/* =========================
   📊 STOCK LIST
========================= */

const STOCKS = {
  LargeCap: [
    // Nifty 50
    "NIFTY.NS",
  "BANKNIFTY.NS", "RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","ICICIBANK.NS","SBIN.NS",
    "LT.NS","HINDUNILVR.NS","ITC.NS","KOTAKBANK.NS","AXISBANK.NS","BAJFINANCE.NS",
    "ASIANPAINT.NS","MARUTI.NS","SUNPHARMA.NS","TITAN.NS","ULTRACEMCO.NS",
    "NESTLEIND.NS","WIPRO.NS",
    "ADANIENT.NS","ADANIPORTS.NS","COALINDIA.NS","JSWSTEEL.NS","TATASTEEL.NS",
    "INDUSINDBK.NS","BAJAJFINSV.NS","HCLTECH.NS","DRREDDY.NS","CIPLA.NS",
    "DIVISLAB.NS","BRITANNIA.NS","EICHERMOT.NS","HEROMOTOCO.NS",
    "SHREECEM.NS","UPL.NS","TECHM.NS","TATACONSUM.NS",
    "APOLLOHOSP.NS","ADANIGREEN.NS","ADANITRANS.NS","ADANIPOWER.NS"
  ],

  MidCap: [
    // Nifty Next 50 + Midcap leaders
    "PIDILITIND.NS","DMART.NS","SIEMENS.NS","ABB.NS","HAVELLS.NS","DABUR.NS",
    "BANKBARODA.NS","PNB.NS","ICICIPRULI.NS","ICICIGI.NS","SBILIFE.NS",
    "HDFCLIFE.NS","INDIGO.NS","NAUKRI.NS","COLPAL.NS","GODREJCP.NS",
    "MCDOWELL-N.NS","VEDL.NS","AMBUJACEM.NS","ACC.NS","SAIL.NS",
    "JUBLFOOD.NS","BERGEPAINT.NS","TRENT.NS","MPHASIS.NS","LTIM.NS",
    "COFORGE.NS","PERSISTENT.NS","TATAELXSI.NS","KPITTECH.NS","LUPIN.NS",
    "AUROPHARMA.NS","ZYDUSLIFE.NS","TORNTPHARM.NS","ALKEM.NS",
    "BALKRISIND.NS","ASHOKLEY.NS","BHARATFORG.NS","ESCORTS.NS",
    "SRF.NS","PIIND.NS","DIXON.NS","INDIAMART.NS","PAGEIND.NS",
    "MUTHOOTFIN.NS","CHOLAFIN.NS","LICHSGFIN.NS",
    "FEDERALBNK.NS","IDFCFIRSTB.NS","BANDHANBNK.NS"
  ],

  SmallCap: [
    // keep limited for performance
    "IRCTC.NS","CDSL.NS","BSE.NS","MCX.NS",
    "CLEAN.NS","ROUTE.NS","HAPPSTMNDS.NS","TANLA.NS",
    "EASEMYTRIP.NS","NAZARA.NS"
  ]
}; 
const ALL_STOCKS = Object.values(STOCKS).flat();

export default function App() {

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockMap, setStockMap] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [topMovers, setTopMovers] = useState({ gainers: [], losers: [] });
  const [maData, setMaData] = useState([]);

  const [rsiData, setRsiData] = useState({
    oneHour: { oversold: [], overbought: [] },
    fifteenMin: { oversold: [], overbought: [] },
    thirtyMin: { oversold: [], overbought: [] }
  });

  const format = (num) => Number(num || 0).toFixed(2);

  // 🔥 FRONTEND CACHE
  const stockCache = {};

  /* =========================
     🔥 FETCH STOCK (CACHED)
  ========================= */
  const fetchStock = async (symbol) => {
    try {
      if (stockCache[symbol]) {
        const { data, time } = stockCache[symbol];

        if (Date.now() - time < 60000) {
          console.log("🟡 CACHE HIT:", symbol);

          setStockMap(prev => ({
            ...prev,
            [symbol]: data
          }));

          return;
        }
      }

      const res = await axios.get(`http://localhost:5000/stock/${symbol}`);

      stockCache[symbol] = {
        data: res.data,
        time: Date.now()
      };

      setStockMap(prev => ({
        ...prev,
        [symbol]: res.data
      }));

    } catch {
      console.log("❌ Fetch error:", symbol);
    }
  };

  /* =========================
     🔥 ROTATING WATCHLIST
  ========================= */
  useEffect(() => {
    if (watchlist.length === 0) return;

    let index = 0;
    const BATCH_SIZE = 5;

    const interval = setInterval(() => {
      const batch = watchlist.slice(index, index + BATCH_SIZE);

      console.log("🔄 Watchlist batch:", batch);

      batch.forEach(fetchStock);

      index += BATCH_SIZE;
      if (index >= watchlist.length) index = 0;

    }, 60000);

    return () => clearInterval(interval);

  }, [watchlist]);


  /* =========================
   🔥 MA200 SCREENER
========================= */
useEffect(() => {
  const fetchMA = async () => {
    try {
      const res = await fetch("http://localhost:5000/screener");
      const data = await res.json();

      setMaData(data);
    } catch (err) {
      console.error("MA Screener Error:", err);
    }
  };

  fetchMA();

  const interval = setInterval(fetchMA, 300000);

  return () => clearInterval(interval);

}, []);
  /* =========================
     🌍 OPTIONAL MARKET ROTATION
  ========================= */
  useEffect(() => {
    let index = 0;
    const BATCH_SIZE = 5;

    const interval = setInterval(() => {
      const batch = ALL_STOCKS.slice(index, index + BATCH_SIZE);

      console.log("🌍 Market batch:", batch);

      batch.forEach(fetchStock);

      index += BATCH_SIZE;
      if (index >= ALL_STOCKS.length) index = 0;

    }, 90000);

    return () => clearInterval(interval);

  }, []);

  /* =========================
     🔥 SELECT STOCK
  ========================= */
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    fetchStock(stock);
    setQuery("");
    setSuggestions([]);
  };

  /* =========================
     🔥 WATCHLIST
  ========================= */
  const addToWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) return;

    const updated = [...watchlist, symbol];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));

    fetchStock(symbol);
  };

  const removeFromWatchlist = (symbol) => {
    const updated = watchlist.filter(s => s !== symbol);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  const handleWatchlistClick = (symbol) => {
    setSelectedStock(symbol);
    fetchStock(symbol);
  };

  /* =========================
     🔥 LOAD WATCHLIST
  ========================= */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("watchlist")) || [];
    setWatchlist(saved);
  }, []);

  /* =========================
     🔥 DEFAULT STOCK
  ========================= */
  useEffect(() => {
    if (!selectedStock) {
      setSelectedStock("RELIANCE.NS");
      fetchStock("RELIANCE.NS");
    }
  }, []);

  /* =========================
     🔥 ACTIVE STOCK REFRESH
  ========================= */
  useEffect(() => {
    if (!selectedStock) return;

    fetchStock(selectedStock);

    const interval = setInterval(() => {
      fetchStock(selectedStock);
    }, 60000);

    return () => clearInterval(interval);

  }, [selectedStock]);

  /* =========================
     🔥 TOP MOVERS
  ========================= */
  useEffect(() => {
    const fetchTopMovers = async () => {
      const res = await fetch("http://localhost:5000/stock/top-movers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: ALL_STOCKS })
      });

      const data = await res.json();
      setTopMovers(data);
    };

    fetchTopMovers();
    const interval = setInterval(fetchTopMovers, 300000);

    return () => clearInterval(interval);

  }, []);

  /* =========================
     🔥 RSI SCREENER
  ========================= */
  useEffect(() => {
    const fetchRSI = async () => {
      const res = await fetch("http://localhost:5000/stock/rsi-screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: ALL_STOCKS })
      });

      const data = await res.json();
      setRsiData(data);
    };

    fetchRSI();
    const interval = setInterval(fetchRSI, 300000);

    return () => clearInterval(interval);

  }, []);

  /* =========================
     🔥 SEARCH
  ========================= */
  useEffect(() => {
    if (!query) return setSuggestions([]);

    const filtered = ALL_STOCKS.filter(s =>
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

        <div className="col-span-2">

          <StockDetails
            stock={selectedStockData}
            symbol={selectedStock}
            format={format}
            addToWatchlist={addToWatchlist}
          />

          <TopMovers
            gainers={topMovers.gainers}
            losers={topMovers.losers}
            format={format}
          />

          <RSIScreener
            data={rsiData}
            handleSelectStock={handleSelectStock}
          />
            <MAScreener
  data={maData}
  handleSelectStock={handleSelectStock}
/>

        </div>
      
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