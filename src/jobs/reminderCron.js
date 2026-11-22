
import cron from "node-cron";
import { dispatchUpcomingReminders } from "../services/reminderService.js";

let reminderTask = null;
let reminderJobRunning = false;

export const initReminderScheduler = () => {
  if (reminderTask) {
    console.log("[Cron Job] Reminder scheduler is already initialized.");
    return reminderTask;
  }

  reminderTask = cron.schedule(
    "0 * * * *",
    async () => {
      if (reminderJobRunning) {
        console.log(
          "[Cron Job] Previous reminder check is still running. Skipping this cycle."
        );
        return;
      }

      reminderJobRunning = true;

      console.log(
        "[Cron Job] Running hourly appointment reminder check..."
      );

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
      } finally {
        reminderJobRunning = false;
      }
    },
    {
      timezone: "Africa/Lagos"
    }
  );

  console.log("[Cron Job] Reminder scheduler initialized.");

  return reminderTask;
};

export const stopReminderScheduler = () => {
  if (!reminderTask) {
    return;
  }

  reminderTask.stop();
  reminderTask = null;

  console.log("[Cron Job] Reminder scheduler stopped.");
};
