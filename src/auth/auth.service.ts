import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { SigninDto, SignupDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    try {
      const hash = await argon.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          first_name: dto.firstName,
          last_name: dto.lastName,
          age: dto.age,
        },
      });

      return this.signToken(user.user_id, user.email);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new BadRequestException('Email already exist');
        }
      }

      throw err;
    }
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Email or password was incorrect',
      );
    }

    const isCorrect = await argon.verify(user.password, dto.password);

    if (!isCorrect) {
      throw new UnauthorizedException(
        'Email or password was incorrect',
      );
    }

    return this.signToken(user.user_id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '15m',
    });

    return {
      access_token: token,
    };
  }
}
