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
      to: userEmail,
      subject: 'Account confirmation',
      text: token,
      template: 'user-account-activation.template.pug',
      context: {
        activationLink: link,
      },
    });
  }
}
