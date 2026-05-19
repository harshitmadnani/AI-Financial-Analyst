import { generatePredictions } from "../services/aiPredictionService.js";

export const getPredictions = async (req, res) => {
  try {
    const predictions = await generatePredictions();
    res.json(predictions);
  } catch (error) {
    console.error("Prediction Error:", error.message);
    res.status(500).json({ error: "Failed to generate predictions" });
  }
};