import { dispatchUpcomingReminders } from '../services/reminderService.js';

export const triggerReminders = async (req, res, next) => {
  try {
    const cronSecret = req.headers['x-cron-secret'];
    
    // Validate trigger secret if invoked via HTTP webhook/cron service
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED_CRON',
        message: 'Invalid CRON authorization secret header',
      });
    }

    const result = await dispatchUpcomingReminders();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err) {
    next(err);
  }
};