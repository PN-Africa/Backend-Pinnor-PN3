import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;