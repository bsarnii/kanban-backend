import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { Request as Req } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { UsersService } from './users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { MailService } from 'src/mail/mail.service';
import { minutes, Throttle } from '@nestjs/throttler';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}
  @Get('whoami')
  whoami(@Request() req: Req) {
    return req.user;
  }

  @Throttle({ default: { ttl: minutes(5), limit: 10 } })
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.usersService.signUp(signUpDto);
    const token = this.usersService.createVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, user.name, token);
  }

  @Throttle({ default: { ttl: minutes(5), limit: 10 } })
  @Public()
  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return await this.usersService.resendVerificationEmail(email);
  }

  @Throttle({ default: { ttl: minutes(5), limit: 10 } })
  @Public()
  @Get('verify')
  async verify(@Query('token') token: string): Promise<{ message: string }> {
    return await this.usersService.verifyEmail(token);
  }
}
