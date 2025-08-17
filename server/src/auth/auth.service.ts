import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // --- Core CRUD Operations ---

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      // Le champ 'permissions' qui causait l'erreur a été retiré de cet objet.
      return this.prisma.user.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('A user with this email already exists.');
      }
      console.error('Failed to create user:', error);
      throw new InternalServerErrorException('Could not create user.');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      throw new InternalServerErrorException('Could not update user.');
    }
  }

  async remove(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User with ID "${id}" not found.`);
      }
      throw new InternalServerErrorException('Could not delete user.');
    }
  }
  
  // --- Utility & Business Logic Methods ---
  
  async logAction(userId: string, action: string, details?: object) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          details: details ? JSON.stringify(details) : undefined,
        },
      });
    } catch (error) {
      console.error(`Failed to log action "${action}" for user ${userId}:`, error);
    }
  }
}