
import "dotenv/config";

import app from "./app.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initReminderScheduler } from "./jobs/reminderCron.js";

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Pinnor Healthcare Appointment API running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );

  initReminderScheduler();
});

export default server;
