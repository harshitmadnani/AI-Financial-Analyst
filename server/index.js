import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import predictionRoutes from "./routes/predictionRoutes.js";

import screenerRoute from "./routes/screenerRoute.js";  // 👈 import
import stockRoutes from "./routes/stockRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/predictions", predictionRoutes);

// 👇 routes
app.use("/screener", screenerRoute);
app.use("/stock", stockRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
