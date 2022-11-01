import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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

  async getFriendRequests(userId: number) {
    const friendRequests = await this.prisma
      .$queryRaw`SELECT "userId", "firstName", "lastName", age FROM friendships LEFT JOIN users ON friendships."friendRequestId" = users."userId" WHERE "friendAcceptId"=${userId} AND accepted=FALSE;`;

    return friendRequests;
  }

  async addFriendRequest(
    requesterUserId: number,
    receiverUserId: number,
  ) {
    if (requesterUserId === receiverUserId) {
      throw new BadRequestException('Invalid operation');
    }

    const receiverUser = await this.prisma.user.findUnique({
      where: {
        userId: receiverUserId,
      },
    });

    if (!receiverUser) {
      throw new NotFoundException('User not found');
    }

    const friendshipCount: number =
      await this.prisma.friendship.count({
        where: {
          OR: [
            {
              friendRequestId: requesterUserId,
              friendAcceptId: receiverUserId,
            },
            {
              friendRequestId: receiverUserId,
              friendAcceptId: requesterUserId,
            },
          ],
        },
      });

    if (friendshipCount > 0) {
      throw new BadRequestException('Friendship already exists');
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        friendRequestId: requesterUserId,
        friendAcceptId: receiverUserId,
      },
    });

    console.log(friendship);

    return {
      success: true,
    };
  }
}
