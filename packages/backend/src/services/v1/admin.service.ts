import { AccountStatus, Prisma, PrismaClient, UserRoles } from '@prisma/client';
import prisma from '../../lib/prisma';

export default class UserDBService {
  prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async setUserRoles(userId: string, userRoles: UserRoles[]) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          roles: {
            set: userRoles
          }
        }
      });
      if (updatedUser) {
        return { data: updatedUser, error: null, code: 201 }
      }
      return { data: updatedUser, error: 'Error updating user roles', code: 400 }
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 }
    }
  }
}