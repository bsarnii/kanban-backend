import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let mailerService: jest.Mocked<MailerService>;
  let configService: jest.Mocked<ConfigService>;

  const mockMailerService: jest.Mocked<Partial<MailerService>> = {
    sendMail: jest.fn().mockResolvedValue(undefined),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get(MailerService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    const to = 'user@example.com';
    const name = 'Test User';
    const token = 'abc123token';
    const frontendUrl = 'https://mykanbanapp.com';

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(frontendUrl);
    });

    it('should call mailerService.sendMail with correct arguments', async () => {
      await service.sendVerificationEmail(to, name, token);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Verify your email',
        template: 'verification',
        context: {
          name,
          verificationLink: `${frontendUrl}/auth/verification/${token}`,
        },
      });
    });

    it('should use FRONTEND_URL from configService to build verificationLink', async () => {
      const customFrontendUrl = 'https://custom.frontend.com';
      mockConfigService.get.mockReturnValue(customFrontendUrl);

      await service.sendVerificationEmail(to, name, token);

      expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            verificationLink: `${customFrontendUrl}/auth/verification/${token}`,
          }),
        }),
      );
    });

    it('should include the correct email recipient', async () => {
      const recipient = 'another@user.com';
      await service.sendVerificationEmail(recipient, name, token);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: recipient }),
      );
    });

    it('should include the recipient name in the template context', async () => {
      const userName = 'Jane Doe';
      await service.sendVerificationEmail(to, userName, token);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({ name: userName }),
        }),
      );
    });

    it('should embed the token correctly in the verificationLink', async () => {
      const specificToken = 'very-specific-token-xyz';
      await service.sendVerificationEmail(to, name, specificToken);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            verificationLink: `${frontendUrl}/auth/verification/${specificToken}`,
          }),
        }),
      );
    });

    it('should use the verification template', async () => {
      await service.sendVerificationEmail(to, name, token);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'verification' }),
      );
    });

    it('should use "Verify your email" as the email subject', async () => {
      await service.sendVerificationEmail(to, name, token);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Verify your email' }),
      );
    });

    it('should propagate errors thrown by mailerService.sendMail', async () => {
      const emailError = new Error('SMTP connection failed');
      mockMailerService.sendMail = jest.fn().mockRejectedValue(emailError);

      await expect(
        service.sendVerificationEmail(to, name, token),
      ).rejects.toThrow('SMTP connection failed');
    });

    it('should handle undefined FRONTEND_URL gracefully by building link with undefined', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      await service.sendVerificationEmail(to, name, token);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            verificationLink: `undefined/auth/verification/${token}`,
          }),
        }),
      );
    });
  });
});