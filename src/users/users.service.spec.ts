import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { Repository, UpdateResult } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;
  let jwtService: JwtService;

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
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John',
    };
    it('should throw a ConflictException if the user already exists', async () => {
      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue({ id: '1', ...signUpDto } as User);
      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should successfully hash the password and save the user', async () => {
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue({
        id: '1',
        ...signUpDto,
        password: 'hashed_password',
      } as User);
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      const result = await service.signUp(signUpDto);

      expect(argon2.hash).toHaveBeenCalledWith('password123');
      expect(saveSpy).toHaveBeenCalledWith({
        ...signUpDto,
        password: 'hashed_password',
      });
      expect(result.password).toEqual('hashed_password');
    });

    describe('verifyEmail', () => {
      it('should throw BadRequestException if token verification fails', async () => {
        jest
          .spyOn(jwtService, 'verifyAsync')
          .mockRejectedValue(new Error('JWT expired'));

        await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw NotFoundException if user inside the token payload does not exist', async () => {
        jest
          .spyOn(jwtService, 'verifyAsync')
          .mockResolvedValue({ sub: 'user-123' });
        jest.spyOn(repo, 'findOne').mockResolvedValue(null);
        await expect(service.verifyEmail('valid-token')).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should return "Already verified" message if user is already verified', async () => {
        jest
          .spyOn(jwtService, 'verifyAsync')
          .mockResolvedValue({ sub: 'user-123' });
        jest
          .spyOn(repo, 'findOne')
          .mockResolvedValue({ id: 'user-123', emailVerified: true } as User);

        const result = await service.verifyEmail('valid-token');
        expect(result).toEqual({ message: 'Already verified' });
      });

      it('should successfully verify user email and update the database', async () => {
        jest
          .spyOn(jwtService, 'verifyAsync')
          .mockResolvedValue({ sub: 'user-123' });
        jest
          .spyOn(repo, 'findOne')
          .mockResolvedValue({ id: 'user-123', emailVerified: false } as User);
        const updateSpy = jest
          .spyOn(repo, 'update')
          .mockResolvedValue({} as UpdateResult);

        const result = await service.verifyEmail('valid-token');

        expect(updateSpy).toHaveBeenCalledWith('user-123', {
          emailVerified: true,
        });
        expect(result).toEqual({ message: 'Email verified successfully' });
      });
    });
  });
});
