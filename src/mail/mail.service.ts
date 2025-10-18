import { MailerService } from '@nestjs-modules/mailer/dist/mailer.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  private get frontendUrl() {
    return this.configService.get<string>('FRONTEND_URL');
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Verify your email',
      template: 'verification', // points to verification.hbs
      context: {
        name: `${name}`,
        verificationLink: `${this.frontendUrl}/auth/verification/${token}`,
      },
    });
  }
}
