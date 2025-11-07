import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private from: string;
  private readonly logger = new Logger(MailService.name);
  private usingEthereal = false;
  private etherealTestAccountInfo: { user: string; pass: string; previewUrl?: string | null } | null = null;

  constructor(private config: ConfigService) {
    this.from = this.config.get('EMAIL_FROM') || 'no-reply@afrikamart.example';
    this.initTransporter().catch(err => {
      this.logger.error('Failed to initialize transporter', err);
    });
  }

  private mask(s?: string) {
    if (!s) return '<missing>';
    if (s.length <= 4) return '****';
    return s.slice(0, 2) + '****' + s.slice(-2);
  }

  private isTruthyString(v: any) {
    return typeof v === 'string' && v.trim().length > 0;
  }

  private async initTransporter() {
    const host = this.config.get<string>('SMTP_HOST') ?? this.config.get<string>('EMAIL_HOST');
    const portRaw = this.config.get<any>('SMTP_PORT') ?? this.config.get<any>('EMAIL_PORT');
    const port = portRaw ? Number(portRaw) : 587;
    const user = this.config.get<string>('SMTP_USER') ?? this.config.get<string>('EMAIL_USER');
    const pass = this.config.get<string>('SMTP_PASS') ?? this.config.get<string>('EMAIL_PASS');

    this.logger.debug(`MailService config host=${this.mask(host)} port=${port} user=${this.mask(user)}`);

    if (this.isTruthyString(host) && this.isTruthyString(user) && this.isTruthyString(pass)) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        await transporter.verify();
        this.transporter = transporter;
        this.usingEthereal = false;
        this.logger.log('MailService: connected to SMTP server using provided credentials.');
        return;
      } catch (err) {
        this.logger.error('MailService: provided SMTP credentials failed to connect — falling back to Ethereal', err);
        this.transporter = null;
      }
    } else {
      this.logger.warn('MailService: SMTP credentials not fully provided - using Ethereal for dev.');
    }

    try {
      const testAccount = await nodemailer.createTestAccount();
      this.etherealTestAccountInfo = { user: testAccount.user, pass: testAccount.pass };
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.usingEthereal = true;
      this.logger.log(`MailService: using Ethereal test account ${this.mask(testAccount.user)} (dev only)`);
    } catch (err) {
      this.logger.error('MailService: failed to create Ethereal account', err);
      throw err;
    }
  }

  private async ensureTransporter() {
    if (!this.transporter) {
      await this.initTransporter();
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    await this.ensureTransporter();
    if (!this.transporter) throw new Error('No mail transporter available');

    const from = this.from;
    try {
      const info = await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email queued to ${to}; messageId=${info.messageId}`);

      if (this.usingEthereal) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Ethereal preview URL: ${previewUrl}`);
          if (this.etherealTestAccountInfo) {
            this.etherealTestAccountInfo.previewUrl = previewUrl ?? null;
    }
       }
      }
      return info;
    } catch (err) {
      this.logger.error('Failed to send email', err);
      throw err;
    }
  }

  async sendVerificationEmail(to: string, link: string) {
    const html = `
      <h3>Verify your AfrikaMart account</h3>
      <p>Click to verify your email:</p>
      <a href="${link}" target="_blank">${link}</a>
    `;
    return this.sendMail(to, 'Verify your AfrikaMart account', html);
  }

  async sendResetPasswordEmail(to: string, link: string) {
    const html = `
      <h3>Reset your AfrikaMart password</h3>
      <p>This link will expire in 1 hour:</p>
      <a href="${link}" target="_blank">${link}</a>
    `;
    return this.sendMail(to, 'AfrikaMart password reset', html);
  }

  getEtherealInfo() {
    return this.etherealTestAccountInfo;
  }
}
