import cron from "node-cron";

import {
  process48HourReminders,
  process24HourReminders
} from "../services/reminderService.js";

export const startReminderJob = () => {
  cron.schedule("*/30 * * * *", async () => {
    console.log("Running appointment reminder job...");

    try {
      await process48HourReminders();
      await process24HourReminders();

      console.log("Appointment reminder job completed.");
    } catch (error) {
      console.error(
        "Appointment reminder job failed:",
        error
      );
    }
  });

  console.log("Appointment reminder job started.");
};