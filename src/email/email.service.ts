import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}

  sendMail(from: string, to: string, subject: string, text: string): void {
    this.mailService.sendMail({
      from: 'test',
      to,
      subject,
      text,
      template: 'test',
    });
  }

  sendAccountConfirmationMail(to: string, token: string, email: string): void {
    const link = `http://localhost:3000?requestId=${token}&userEmail=${email}`;
    this.mailService.sendMail({
      to,
      subject: 'Account confirmation',
      text: token,
      template: 'activation',
      context: {
        activationLink: link,
      },
    });
  }
}
