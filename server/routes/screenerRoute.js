import express from "express";
import { runScreener } from "../services/screenerService.js";
import { analyzeTrade } from "../services/aiService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rawData = await runScreener();

    const finalResults = [];

    for (const stock of rawData) {
      const analysis = await analyzeTrade(stock);

      finalResults.push({
        ...stock,
        analysis
      });
    }

    res.json(finalResults);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;