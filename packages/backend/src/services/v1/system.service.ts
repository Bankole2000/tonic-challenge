import { PrismaClient } from '@prisma/client';
import prisma from '../../lib/prisma';

export default class SystemDBService {
  prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getBanks(page = 1, limit = 20) {
    try {
      const banks = await this.prisma.bank.findMany({
        take: limit,
        skip: (page - 1) * limit,
      });
      const total = await this.prisma.bank.count();
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: banks, pages, page, prev, next, total
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async searchBanks(searchTerm: string, page = 1, limit = 20) {
    try {
      const banks = await this.prisma.bank.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive'
              },
            },
            {
              code: {
                contains: searchTerm,
                mode: 'insensitive'
              },
            },
          ]
        }
      });
      const total = await this.prisma.bank.count({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive'
              },
            },
            {
              code: {
                contains: searchTerm,
                mode: 'insensitive'
              },
            },
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: banks, searchTerm, pages, prev, next, total, page
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }
}
