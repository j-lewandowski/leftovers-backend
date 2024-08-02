import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}

  sendMail(from: string, to: string, subject: string, text: string): void {
    this.mailService.sendMail({
      from,
      to,
      subject,
      text,
    });
  }
}
