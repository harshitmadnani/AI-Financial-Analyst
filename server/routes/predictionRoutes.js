import express from "express";
import { getPredictions } from "../controllers/predictionController.js";

const router = express.Router();

router.get("/", getPredictions);

export default router;