import express from "express";
import { getStock, getTopMovers } from "../controllers/stockController.js";

const router = express.Router();

router.get("/:symbol", getStock);
router.post("/top-movers", getTopMovers);

export default router;