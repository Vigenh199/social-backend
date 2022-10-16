import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto, GetUsersDto } from './dto';
import { Pagination } from './type';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(pagination: Pagination, dto: GetUsersDto) {
    const queryObject = this.getQueryObject(dto);

    const users = await this.prisma.user.findMany({
      where: {
        ...queryObject,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        age: true,
      },
      skip: pagination.skip,
      take: pagination.limit,
    });

    const count = await this.prisma.user.count({
      where: {
        ...queryObject,
      },
    });

    const pages = Math.ceil(count / pagination.limit);

    return { users, pages };
  }

  getQueryObject(dto: GetUsersDto): {
    firstName?: { startsWith: string };
    lastName?: { startsWith: string };
    age?: number;
  } {
    const queryObject: {
      firstName?: { startsWith: string };
      lastName?: { startsWith: string };
      age?: number;
    } = {};

    if (dto.firstName) {
      queryObject.firstName = {
        startsWith: dto.firstName,
      };
    }

    if (dto.lastName) {
      queryObject.lastName = {
        startsWith: dto.lastName,
      };
    }

    if (dto.age) {
      queryObject.age = dto.age;
    }

    return queryObject;
  }

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.password;

    return user;
  }
}
