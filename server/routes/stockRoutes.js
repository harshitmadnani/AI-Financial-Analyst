import express from "express";
import { getRSIScreener, getStock, getTopMovers } from "../controllers/stockController.js";

const router = express.Router();

router.get("/:symbol", getStock);
router.post("/rsi-screener", getRSIScreener);
router.post("/top-movers", getTopMovers);

export default router;