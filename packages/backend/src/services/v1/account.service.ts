import {
  Prisma, PrismaClient, TransactionType, TransferStatus
} from '@prisma/client';
import prisma from '../../lib/prisma';

export default class AccountDBService {
  prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async createUserAccount(accountNumber: string, bankId: string, userId: string) {
    try {
      const newAccount = await this.prisma.account.create({
        data: {
          accountNumber,
          userId,
          bankId
        },
        include: {
          bank: true,
          _count: {
            select: {
              receivedTransfers: true,
              sentTransfers: true,
              transactions: true,
            }
          }
        }
      });
      if (newAccount) {
        return { data: newAccount, error: null, code: 200 };
      }
      return { data: null, error: 'Error creating user bank account', code: 400 };
    } catch (error: any) {
      return { data: null, error, code: 500 };
    }
  }

  async deleteUserAccount(accountId: string) {
    try {
      const deletedAccount = await this.prisma.account.delete({
        where: {
          id: accountId
        }
      });
      if (deletedAccount) {
        return { data: deletedAccount, error: null, code: 201 };
      }
      return { data: deletedAccount, error: 'Error deleting account', code: 400 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async getAccountDetails(accountId: string) {
    try {
      const accountDetails = await this.prisma.account.findUnique({
        where: {
          id: accountId
        },
        include: {
          bank: true,
          user: {
            select: {
              firstname: true,
              lastname: true,
              id: true,
            }
          },
          _count: {
            select: {
              receivedTransfers: true,
              sentTransfers: true,
              transactions: true,
            }
          }
        }
      });
      if (accountDetails) {
        return { data: accountDetails, error: null, code: 200 };
      }
      return { data: null, error: 'Account not found', code: 404 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async findBankAccount(bankId: string, accountNumber: string) {
    try {
      const account = await this.prisma.account.findFirst({
        where: {
          AND: [
            {
              accountNumber
            },
            {
              bankId
            }
          ]
        },
        include: {
          user: {
            select: {
              firstname: true,
              lastname: true,
              id: true,
            }
          },
          bank: true,
        }
      });
      if (account) {
        return { data: account, error: null, code: 200 };
      }
      return { data: null, error: 'Account not found', code: 404 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async creditAccount(accountId: string, amount: number, description: string, type: TransactionType = 'CREDIT', transferId: string | null = null) {
    try {
      const creditTxn = await this.prisma.transaction.create({
        data: {
          accountId,
          description,
          amount,
          transferId,
          type,
        }
      });
      const balance = await this.prisma.account.update({
        where: {
          id: accountId
        },
        data: {
          balance: {
            increment: +amount
          }
        }
      });
      if (creditTxn) {
        return { data: { txn: creditTxn, balance }, error: null, code: 200 };
      }
      return { data: null, error: 'Error crediting account', code: 400 };
    } catch (error) {
      return { data: null, error, code: 500 };
    }
  }

  async debitAccount(accountId: string, amount: number, description: string, type: TransactionType = 'DEBIT', transferId: string | null = null) {
    try {
      const debitTxn = await this.prisma.transaction.create({
        data: {
          accountId,
          description,
          amount,
          transferId,
          type,
        }
      });
      const balance = await this.prisma.account.update({
        where: {
          id: accountId
        },
        data: {
          balance: {
            increment: -amount
          }
        }
      });
      if (debitTxn) {
        return { data: { txn: debitTxn, balance }, error: null, code: 200 };
      }
      return { data: null, error: 'Error debiting account', code: 400 };
    } catch (error: any) {
      return { data: null, error, code: 500 };
    }
  }

  async initiateTransfer(
    originAccountId: string,
    destinationAccountId: string,
    amount: number,
    description: string | undefined
  ) {
    try {
      const newTransfer = await this.prisma.transfer.create({
        data: {
          originAccountId,
          destinationAccountId,
          description,
          amount,
          status: 'PENDING'
        }
      });
      if (newTransfer) {
        return { data: newTransfer, error: null, code: 200 };
      }
      return { data: null, error: 'Error initiating transfer', code: 400 };
    } catch (error: any) {
      return { data: null, error, code: 500 };
    }
  }

  async updateTransferStatus(transferId: string, status: TransferStatus) {
    try {
      const updatedTransfer = await this.prisma.transfer.update({
        where: {
          id: transferId
        },
        data: {
          status,
        },
        include: {
          destinationAccount: {
            include: {
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                  id: true,
                }
              },
              bank: true
            },
          },
          originAccount: {
            include: {
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                  id: true,
                }
              },
              bank: true
            }
          }
        }
      });
      if (updatedTransfer) {
        return { data: updatedTransfer, error: null, code: 200 };
      }
      return { data: null, error: 'Error updating transfer status', code: 400 };
    } catch (error: any) {
      return { data: null, error, code: 500 };
    }
  }

  async getAccountTransactions(accountId: string, page = 1, limit = 20) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          accountId
        },
        include: {
          transfer: true
        }
      });
      const total = await this.prisma.transaction.count({
        where: {
          accountId
        },
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: transactions, pages, page, prev, next, total, limit,
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async searchAccountTransactions(
    accountId: string,
    startDate: string,
    endDate: string,
    page = 1,
    limit = 20
  ) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          AND: [
            {
              accountId,
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
          transfer: true
        }
      });
      const total = await this.prisma.transaction.count({
        where: {
          AND: [
            {
              accountId,
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
          data: transactions,
          searchTerm: { startDate, endDate },
          pages,
          page,
          prev,
          next,
          total,
          limit
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async getAllAccounts(page = 1, limit = 25) {
    try {
      const accounts = await this.prisma.account.findMany({
        take: limit,
        skip: (page - 1) * limit,
        include: {
          user: {
            select: {
              firstname: true,
              lastname: true,
              id: true,
            }
          },
          bank: true
        }
      });
      const total = await this.prisma.account.count();
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return {
        data: {
          data: accounts, pages, page, prev, next, total, limit
        },
        error: null,
        code: 200
      };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async searchAllAccounts(searchTerm: string, page = 1, limit = 25) {
    try {
      const accounts = await this.prisma.account.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          OR: [
            {
              user: {
                OR: [
                  {
                    firstname: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                    lastname: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                    email: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            },
            {
              bank: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            }
          ]
        },
        include: {
          user: true,
          bank: true,
          _count: {
            select: {
              receivedTransfers: true,
              sentTransfers: true,
              transactions: true
            }
          }
        }
      });
      const total = await this.prisma.account.count({
        where: {
          OR: [
            {
              user: {
                OR: [
                  {
                    firstname: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                    lastname: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                    email: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            },
            {
              bank: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
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
          data: accounts, searchTerm, pages, page, prev, next, total, limit
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
