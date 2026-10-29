
import cron from "node-cron";
import { dispatchUpcomingReminders } from "../services/reminderService.js";

export const initReminderScheduler = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("[Cron Job] Running hourly appointment reminder check...");

    try {
      const summary = await dispatchUpcomingReminders();

      console.log(
        `[Cron Job] Completed. Sent: ${summary.dispatched_count}; Failed: ${summary.failed_count}`
      );
    } catch (error) {
      console.error(
        "[Cron Job] Reminder check failed:",
        error.message
      );
    }
  });

  console.log("[Cron Job] Reminder scheduler initialized.");
};
