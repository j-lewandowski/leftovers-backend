import { ConfigService } from '@nestjs/config';

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
    options: {
      strict: true,
    },
  },
});
