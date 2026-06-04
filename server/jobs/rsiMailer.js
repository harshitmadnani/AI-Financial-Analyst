import cron from "node-cron";
import { getRSIScreener } from "../controllers/stockController.js";
import { formatRSIEmail } from "../utils/emailFormatter.js";
import { sendRSIMail } from "../services/mailService.js";
import { STOCKS } from "../constants/stocks.js";

// ✅ FIX: flatten stocks
const ALL_STOCKS = Object.values(STOCKS).flat();

export const startRSIMailer = () => {

  cron.schedule("*/5 * * * *", async () => {  // 🔥 every 5 min (test first)
    console.log("📩 Running RSI Mail Job...");
    console.log("📊 Total Symbols:", ALL_STOCKS.length);

    try {

      const mockReq = {
        body: {
          symbols: ALL_STOCKS
        }
      };

      const mockRes = {
        json: async (data) => {

          console.log("📊 RSI DATA RECEIVED");

          const html = formatRSIEmail(data);

          await sendRSIMail(html);

          console.log("✅ RSI Email Sent 🚀");
        }
      };

      await getRSIScreener(mockReq, mockRes);

    } catch (err) {
      console.error("❌ Mailer Error:", err.message);
    }

  });
};