import cron from 'node-cron';
import { processUpcomingReminders } from '../../services/reminder.service.js';

export const initReminderScheduler = () => {
  // Execute every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Running automated appointment reminder check...');
    try {
      await processUpcomingReminders();
    } catch (err) {
      console.error('[CRON ERROR]', err);
    }
  });
};