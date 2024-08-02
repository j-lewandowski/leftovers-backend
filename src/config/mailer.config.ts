import { ConfigService } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

export const getMailerConfig = (config: ConfigService) => ({
  transport: {
    host: config.get('EMAIL_HOST'),
    auth: {
      user: config.get('EMAIL_USERNAME'),
      pass: config.get('EMAIL_PASSWORD'),
    },
  },
  template: {
    dir: process.cwd() + '/templates/',
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
});
