
import "dotenv/config";
import { sendReminderEmail } from "./services/emailService.js";

try {
  const result = await sendReminderEmail({
    to: process.env.RESEND_TEST_RECIPIENT,
    patientName: "Pinnor Test",
    providerName: "Test Provider",
    serviceName: "Test Appointment",
    appointmentDate: "October 28, 2026",
    startTime: "10:00 AM"
  });

  console.log("Resend accepted the test email:", result);
} catch (error) {
  console.error("Email test failed:", error.message);
  process.exitCode = 1;
}
