import { User } from '@prisma/client';
import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Pagination } from './type';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
import { GetUsersPagination } from './decorator';
import { EditUserDto, GetUsersDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Get()
  getAllUsers(
    @GetUsersPagination() pagination: Pagination,
    @Query() dto: GetUsersDto,
  ) {
    return this.userService.getAllUsers(pagination, dto);
  }

  @Patch('me')
  editUser(
    @GetUser('userId') userId: number,
    @Body() dto: EditUserDto,
  ) {
    return this.userService.editUser(userId, dto);
  }
}
