import { MailerService } from '@nestjs-modules/mailer/dist/mailer.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(to: string, name: string, token: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Verify your email',
      template: 'verification', // points to verification.hbs
      context: {
        name: 'User',
        verificationLink: `https://mykanbanboard.eu/verify?token=${token}`,
      },
    });
  }
}
