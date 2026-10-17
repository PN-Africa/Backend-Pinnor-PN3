import { Router } from 'express';
import { triggerReminders } from '../controllers/appointmentReminderController.js';

const router = Router();

// Trigger endpoint invoked by external cron job (e.g., Vercel Cron, GitHub Actions, or cron-job.org)
router.post('/trigger', triggerReminders);

export default router;