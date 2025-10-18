import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import * as argon2 from 'argon2';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email },
    });
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async signUp(payload: SignUpDto) {
    const userExists = await this.findUserByEmail(payload.email);
    if (userExists) {
      throw new ConflictException('Email is already in use');
    }

    const hashedPass = await argon2.hash(payload.password);

    const data = {
      ...payload,
      password: hashedPass,
    };

    return await this.userRepository.save(data);
  }

  //VERIFICATION

  async markVerified(id: string) {
    return this.userRepository.update(id, { emailVerified: true });
  }

  async resendVerificationEmail(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const token = this.createVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, user.name, token);
  }

  createVerificationToken(userId: string) {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('VERIFICATION_JWT_SECRET'),
        expiresIn: '1d',
      },
    );
  }

  async verifyEmail(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        token,
        {
          secret: this.configService.get<string>('VERIFICATION_JWT_SECRET'),
        },
      );

      const user = await this.findById(payload.sub);
      if (!user) throw new NotFoundException('User not found');

      if (user.emailVerified) return { message: 'Already verified' };

      await this.markVerified(user.id);
      return { message: 'Email verified successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
