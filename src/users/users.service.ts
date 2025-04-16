import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email },
    });
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
}
