import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;
  let mailService: MailService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUserRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  });

  const mockMailService = () => ({
    sendVerificationEmail: jest.fn(),
  });

  const mockJwtService = () => ({
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  });

  const mockConfigService = () => ({
    get: jest.fn().mockReturnValue('mock-secret'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: MailService, useFactory: mockMailService },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = { email: 'test@example.com', password: 'password123', name: 'John' };
    it('should throw a ConflictException if the user already exists', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue({ id: '1', ...signUpDto } as User);
      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
    });

    it('should successfully hash the password and save the user', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      jest.spyOn(repo, 'save').mockResolvedValue({ id: '1', ...signUpDto, password: 'hashed_password' } as any);

      const result = await service.signUp(signUpDto);

      expect(argon2.hash).toHaveBeenCalledWith('password123');
      expect(repo.save).toHaveBeenCalledWith({
        ...signUpDto,
        password: 'hashed_password',
      });
      expect(result.password).toEqual('hashed_password');
    });

    describe('verifyEmail', () => {
    it('should throw BadRequestException if token verification fails', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('JWT expired'));

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user inside the token payload does not exist', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: 'user-123' });
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      await expect(service.verifyEmail('valid-token')).rejects.toThrow(NotFoundException);
    });

    it('should return "Already verified" message if user is already verified', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: 'user-123' });
      jest.spyOn(repo, 'findOne').mockResolvedValue({ id: 'user-123', emailVerified: true } as User);

      const result = await service.verifyEmail('valid-token');
      expect(result).toEqual({ message: 'Already verified' });
    });

    it('should successfully verify user email and update the database', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: 'user-123' });
      jest.spyOn(repo, 'findOne').mockResolvedValue({ id: 'user-123', emailVerified: false } as User);
      jest.spyOn(repo, 'update').mockResolvedValue({} as any);

      const result = await service.verifyEmail('valid-token');

      expect(repo.update).toHaveBeenCalledWith('user-123', { emailVerified: true });
      expect(result).toEqual({ message: 'Email verified successfully' });
    });
  });
  
  });
});
