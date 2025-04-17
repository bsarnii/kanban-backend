import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { Request as Req } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { UsersService } from './users.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('whoami')
  whoami(@Request() req: Req) {
    return req.user;
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    await this.usersService.signUp(signUpDto);
  }
}
