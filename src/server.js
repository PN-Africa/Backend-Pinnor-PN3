import app from './app.js';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Pinnor Healthcare Appointment API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});