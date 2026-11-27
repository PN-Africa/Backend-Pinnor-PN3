
import "dotenv/config";

import app from "./app.js";
import {
  initReminderScheduler,
  stopReminderScheduler
} from "./jobs/reminderCron.js";
import { verifyEmailConnection } from "./config/email.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Pinnor Healthcare Appointment API running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );

  initReminderScheduler();

  verifyEmailConnection()
    .then(() => {
      console.log("Google SMTP connection verified successfully.");
    })
    .catch((error) => {
      console.error("Google SMTP connection failed:", error.message);
    });
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down server...`);

  stopReminderScheduler();

  server.close((error) => {
    if (error) {
      console.error("Server shutdown error:", error);
      process.exit(1);
    }

    console.log("HTTP server closed successfully.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default server;
