import cron from 'node-cron';
import { dispatchUpcomingReminders } from '../services/reminderService.js';

export const initReminderScheduler = () => {
  // Runs every hour on the hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron Job] Executing hourly appointment reminder check...');
    try {
      const summary = await dispatchUpcomingReminders();
      console.log(`[Cron Job] Completed. Sent ${summary.dispatched_count} reminders.`);
    } catch (err) {
      console.error('[Cron Job] Failed to execute reminder service:', err);
    }
  });

  console.log('⏰ Reminder cron job initialized (Schedule: 0 * * * *)');
};