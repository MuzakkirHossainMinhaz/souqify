import * as ejs from 'ejs';
import * as fs from 'fs';
import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import * as path from 'path';

const isDev = process.env.NODE_ENV !== 'production';

const TEMPLATES_DIR = path.join(process.cwd(), 'apps/auth-service/src/utils/email/templates');

let transporter: Transporter | null = null;

/**
 * Get the transporter for the email service.
 */
async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  if (isDev) {
    // Development: use Ethereal (fake SMTP) – create test account or use env
    const user = process.env.ETHEREAL_USER;
    const pass = process.env.ETHEREAL_PASS;
    if (user && pass) {
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user, pass },
      });
    } else {
      const account = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      });
      console.log('[Ethereal] Test account created. Preview URLs will be logged.');
    }
  } else {
    // Production: real SMTP from env
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

/**
 * Render an EJS email template with the given data.
 */
export async function renderTemplate<T extends Record<string, unknown>>(
  templateName: string,
  data: T,
): Promise<string> {
  const ext = templateName.endsWith('.ejs') ? '' : '.ejs';
  const filePath = path.join(TEMPLATES_DIR, `${templateName}${ext}`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Email template not found: ${filePath}`);
  }
  return new Promise((resolve, reject) => {
    ejs.renderFile(filePath, data, { async: true }, (err: Error | null, str?: string) => {
      if (err) reject(err);
      else resolve(str ?? '');
    });
  });
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  /** EJS template name (e.g. 'verifyEmail' or 'verifyEmail.ejs') */
  template: string;
  /** Data passed to the template */
  templateData: Record<string, unknown>;
  /** Optional text version (plain text). If omitted, only HTML is sent. */
  text?: string;
  /** Override default from address */
  from?: string;
}

/**
 * Send an email using nodemailer.
 * - Development: uses Ethereal (test SMTP); preview URL logged when using createTestAccount.
 * - Production: uses SMTP_* env vars for real delivery.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { to, subject, template, templateData, text, from } = options;

  const html = await renderTemplate(template, templateData);

  const defaultFrom =
    process.env.MAIL_FROM ?? (isDev ? 'Souqify Dev <noreply@souqify.local>' : 'Souqify <noreply@souqify.com>');

  const message: Mail.Options = {
    from: from ?? defaultFrom,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    ...(text && { text }),
  };

  const transport = await getTransporter();
  const info = await transport.sendMail(message);

  if (isDev && !process.env.ETHEREAL_USER) {
    console.log('[Ethereal] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
}
