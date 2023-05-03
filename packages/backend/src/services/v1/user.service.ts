import { AccountStatus, Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../lib/prisma';

export default class UserDBService {
  prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async createUser(userData: Prisma.UserCreateInput) {
    try {
      const newUser = await this.prisma.user.create({
        data: userData
      });
      if (newUser) {
        return { data: newUser, error: null, code: 201 };
      }
      return { data: null, error: 'Error creating user', code: 400 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async updateUserProfile(userId: string, profileData: Prisma.UserUpdateInput) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          ...profileData
        }
      });
      if (updatedUser) {
        return { data: updatedUser, error: null, code: 201 };
      }
      return { data: updatedUser, error: 'Error updating user', code: 400 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email
        }
      });
      if (user) {
        return { data: user, error: null, code: 200 };
      }
      return { data: null, error: 'User not found', code: 404 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async findUserById(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      if (user) {
        return { data: user, error: null, code: 200 };
      }
      return { data: null, error: 'User not found', code: 404 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async getUsers(page = 1, limit = 12) {
    try {
      const users = (await this.prisma.user.findMany({
        take: limit,
        skip: (page - 1) * limit,
        include: {
          _count: {
            select: {
              accounts: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })).map((u) => {
        const { password: _, ...user } = u;
        return user;
      });
      const total = await this.prisma.user.count();
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: users, pages, page, prev, next, total
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async searchUsers(searchTerm: string, page = 1, limit = 12) {
    try {
      const users = (await this.prisma.user.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          OR: [
            {
              firstname: {
                contains: searchTerm,
                mode: 'insensitive',
              }
            },
            {
              lastname: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          ],
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          _count: {
            select: {
              accounts: true,
            }
          }
        }
      })).map((u) => {
        const { password: _, ...user } = u;
        return user;
      });
      const total = await this.prisma.user.count({
        where: {
          OR: [
            {
              firstname: {
                contains: searchTerm,
                mode: 'insensitive',
              }
            },
            {
              lastname: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          ],
        },
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: users, pages, page, searchTerm, prev, next, total
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async setUserAccountStatus(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          _count: {
            select: {
              accounts: true,
            }
          }
        }
      });
      if (!user) {
        return { data: user, error: 'User profile not found', code: 404 };
      }
      let status: AccountStatus = 'COMPLETE';
      if (!user._count.accounts) {
        status = 'NEEDS_ACCOUNT';
      }
      if (!user.bvn) {
        status = 'BVN_REQUIRED';
      }
      if (!user.firstname || !user.lastname) {
        status = 'BIO_INCOMPLETE';
      }
      if (user.accountStatus !== status) {
        const updatedUserStatus = await this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            accountStatus: status
          }
        });
        return { data: updatedUserStatus, error: null, code: 201 };
      }
      return { data: user, error: null, code: 200 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async getUserAccounts(userId: string) {
    try {
      const userAccounts = await this.prisma.account.findMany({
        where: {
          userId,
        },
        include: {
          _count: {
            select: {
              transactions: true,
              receivedTransfers: true,
              sentTransfers: true,
            }
          },
          bank: true,
        }
      });
      return { data: userAccounts, error: null, code: 200 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async getUserTransactions(userId: string, page = 1, limit = 12) {
    try {
      const txns = await this.prisma.transaction.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          account: {
            userId
          },
        },
        include: {
          transfer: {
            include: {
              destinationAccount: {
                include: {
                  bank: true,
                  user: {
                    select: {
                      id: true,
                      firstname: true,
                      lastname: true,
                    }
                  }
                }
              }
            }
          },
          account: {
            include: {
              bank: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      const total = await this.prisma.transaction.count({
        where: {
          account: {
            userId
          },
        },
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: txns, pages, page, prev, next, total
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async searchUserTransactions(userId: string, startDate: string, endDate: string, page = 1, limit = 12) {
    try {
      const txns = await this.prisma.transaction.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          AND: [
            {
              account: {
                userId
              }
            },
            {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              }
            }
          ]
        },
        include: {
          transfer: true,
          account: {
            include: {
              bank: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      const total = await this.prisma.transaction.count({
        where: {
          AND: [
            {
              account: {
                userId
              }
            },
            {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              }
            }
          ]
        },
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: txns, searchTerm: { startDate, endDate }, pages, page, prev, next, total
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async saveBeneficiaryAccount(userId: string, accountId: string) {
    try {
      const alreadySaved = await this.prisma.userHasBeneficiary.findFirst({
        where: {
          AND: [
            {
              userId,
            },
            {
              accountId
            }
          ]
        }
      });
      if (alreadySaved) {
        return { data: alreadySaved, error: null, code: 200 };
      }
      const newlySaved = await this.prisma.userHasBeneficiary.create({
        data: {
          userId,
          accountId
        }
      });
      if (newlySaved) {
        return { data: newlySaved, error: null, code: 200 };
      }
      return { data: null, error: 'Error Saving Beneficiary', code: 400 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async getUserBeneficiaries(userId: string, page = 1, limit = 20) {
    try {
      const beneficiaries = await this.prisma.userHasBeneficiary.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          userId
        },
        include: {
          account: {
            include: {
              bank: true,
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                  id: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      const total = await this.prisma.userHasBeneficiary.count({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          userId
        },
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: beneficiaries, pages, page, prev, next, total
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async searchBeneficiaries(userId: string, searchTerm: string, page = 1, limit = 20) {
    try {
      const beneficiaries = await this.prisma.userHasBeneficiary.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          AND: [
            {
              userId
            },
            {
              account: {
                user: {
                  OR: [
                    {
                      firstname: {
                        contains: searchTerm,
                        mode: 'insensitive'
                      }
                    },
                    {
                      lastname: {
                        contains: searchTerm,
                        mode: 'insensitive'
                      }
                    }
                  ]
                }
              }
            }
          ]
        },
        include: {
          account: {
            include: {
              bank: true,
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                  id: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      const total = await this.prisma.userHasBeneficiary.count({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          AND: [
            {
              userId
            },
            {
              account: {
                user: {
                  OR: [
                    {
                      firstname: {
                        contains: searchTerm,
                        mode: 'insensitive'
                      }
                    },
                    {
                      lastname: {
                        contains: searchTerm,
                        mode: 'insensitive'
                      }
                    }
                  ]
                }
              }
            }
          ]
        },
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: beneficiaries, pages, page, prev, next, total
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async deleteBeneficiary(userId: string, accountId: string) {
    try {
      const beneficiaryExists = await this.prisma.userHasBeneficiary.findFirst({
        where: {
          AND: [
            {
              userId,
            },
            {
              accountId
            }
          ]
        }
      });
      if (beneficiaryExists) {
        const deletedBeneficiary = await this.prisma.userHasBeneficiary.delete({
          where: {
            id: beneficiaryExists.id
          }
        });
        return { data: deletedBeneficiary, error: null, code: 201 };
      }
      return { data: beneficiaryExists, error: 'Beneficiary not found', code: 404 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }
}
