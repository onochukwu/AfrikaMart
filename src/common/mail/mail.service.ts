import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private from: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST') || 'smtp.ethereal.email',
      port: Number(this.config.get('SMTP_PORT')) || 587,
      auth: {
        user: this.config.get('SMTP_USER') || undefined,
        pass: this.config.get('SMTP_PASS') || undefined,
      },
    });

    this.from = this.config.get('EMAIL_FROM') || 'no-reply@afrikamart.example';
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.debug(`Email sent: ${info.messageId}`);
      return info;
    } catch (err) {
      this.logger.error('Failed to send email', err);
    }
  }

  async sendVerificationEmail(to: string, link: string) {
    const html = `<p>Please verify your email by clicking <a href="${link}">here</a></p>`;
    return this.sendMail(to, 'Verify your AfrikaMart account', html);
  }

  async sendResetPasswordEmail(to: string, link: string) {
    const html = `<p>Reset your password by clicking <a href="${link}">here</a></p>`;
    return this.sendMail(to, 'AfrikaMart password reset', html);
  }
}
