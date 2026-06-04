// import express from "express";
// import { getRSIScreener, getStock, getTopMovers } from "../controllers/stockController.js";

// const router = express.Router();

// router.get("/:symbol", getStock);
// router.post("/rsi-screener", getRSIScreener);
// router.post("/top-movers", getTopMovers);

// export default router;


import express from "express";
import {
  getRSIScreener,
  getStock,
  getTopMovers
} from "../controllers/stockController.js";

const router = express.Router();

// ✅ ALWAYS keep specific routes FIRST
router.post("/rsi-screener", getRSIScreener);
router.post("/top-movers", getTopMovers);

// ❗ ALWAYS keep dynamic route LAST
router.get("/:symbol", getStock);

export default router;