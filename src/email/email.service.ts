import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ejs from 'ejs';
import { readFileSync } from 'fs';
import mjml2html from 'mjml';
import * as path from 'path';

@Injectable()
export class EmailService {
  constructor(
    private mailService: MailerService,
    private configService: ConfigService,
  ) {}

  compileEmailTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): string {
    const mjmlFilePath = path.resolve(
      __dirname,
      './templates',
      `${templateName}.template.mjml`,
    );
    const template = readFileSync(mjmlFilePath, 'utf8');
    const htmlOutput = mjml2html(template);
    const filledHtml = ejs.render(htmlOutput.html, context);

    return filledHtml;
  }

  async sendAccountConfirmationMail(
    userEmail: string,
    token: string,
  ): Promise<void> {
    const link = `${this.configService.get(
      'FRONTEND_BASE_URL',
    )}?requestId=${token}&userEmail=${userEmail}`;

    await this.mailService.sendMail({
      from: this.configService.get('NOREPLY_EMAIL'),
      to: userEmail,
      subject: '👋 Please confirm your e-mail',
      text: token,
      html: this.compileEmailTemplate('user-account-activation', {
        activationUrl: link,
      }),
    });
  }

  async sendPasswordResetMail(
    userEmail: string,
    validationToken: string,
  ): Promise<void> {
    const resetLink = `${this.configService.get(
      'FRONTEND_BASE_URL',
    )}?reset-password=true&requestId=${validationToken}`;
    await this.mailService.sendMail({
      from: this.configService.get('NOREPLY_EMAIL'),
      to: userEmail,
      subject: 'Reset your password',
      text: resetLink,
      html: this.compileEmailTemplate('user-password-reset', {
        resetPasswordUrl: resetLink,
      }),
    });
  }
}
