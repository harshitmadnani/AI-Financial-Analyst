// import express from "express";
// import { runScreener } from "../services/screenerService.js";
// import { analyzeTrade } from "../services/aiService.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const rawData = await runScreener();

//     const finalResults = [];

//     for (const stock of rawData) {
//       const analysis = await analyzeTrade(stock);

//       finalResults.push({
//         ...stock,
//         analysis
//       });
//     }

//     res.json(finalResults);

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;

import express from "express";
import { runScreener } from "../services/screenerService.js";
import { analyzeTrade } from "../services/aiService.js";

const router = express.Router();

// 🔥 Toggle AI (VERY IMPORTANT)
const ENABLE_AI = false;

router.get("/", async (req, res) => {
  try {
    console.log("🚀 Screener API hit");

    const rawData = await runScreener();

    console.log("📊 Stocks found:", rawData.length);

    // ✅ FAST MODE (NO AI)
    if (!ENABLE_AI) {
      return res.json(
        rawData.map((stock) => ({
          ...stock,
          analysis:
            stock.bias === "BUY"
              ? "Bullish setup based on RSI, MACD, EMA"
              : "Bearish setup based on RSI, MACD, EMA"
        }))
      );
    }

    // 🔥 PARALLEL AI CALLS (FAST)
    const finalResults = await Promise.all(
      rawData.map(async (stock) => {
        try {
          const analysis = await analyzeTrade(stock);

          return {
            ...stock,
            analysis
          };
        } catch (err) {
          console.log("❌ AI error:", stock.symbol);

          return {
            ...stock,
            analysis: "AI unavailable"
          };
        }
      })
    );

    res.json(finalResults);

  } catch (error) {
    console.error("❌ Screener error:", error.message);

    res.status(500).json({
      error: "Screener failed",
      message: error.message
    });
  }
});

export default router;