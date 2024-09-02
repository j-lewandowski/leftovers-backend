import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendMail(
    from: string,
    to: string,
    subject: string,
    text: string,
  ): Promise<void> {
    await this.mailService.sendMail({
      from: 'test',
      to,
      subject,
      text,
      template: 'test',
    });
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
      template: 'user-account-activation.template.pug',
      context: {
        activationLink: link,
      },
    });
  }

  async sendPasswordResetMail(
    userEmail: string,
    validationToken: string,
  ): Promise<void> {
    const resetLink = `${this.configService.get(
      'FRONTEND_BASE_URL',
    )}?reset-password=true&requestId=${validationToken}&userEmail=${userEmail}`;
    await this.mailService.sendMail({
      from: this.configService.get('NOREPLY_EMAIL'),
      to: userEmail,
      subject: 'Reset your password',
      text: resetLink,
      template: 'user-password-reset.template.pug',
      context: {
        resetLink,
      },
    });
  }
}
