import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../lib/prisma';

export default class SessionDBService {
  prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async createUserSession(userId: string) {
    try {
      const newSession = await this.prisma.session.create({
        data: {
          userId
        },
        include: {
          user: true
        }
      })
      if (newSession) {
        return { data: newSession, error: null, code: 200 }
      }
      return { data: null, error: 'Error creating user session', code: 400 }
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 }
    }
  }

  async getUserSession(sessionId: string, userId: string) {
    try {
      const session = await this.prisma.session.findFirst({
        where: {
          AND: [
            {
              id: sessionId,
            },
            {
              userId
            }
          ]
        },
        include: {
          user: true
        }
      })
      if (session) {
        return { data: session, error: null, code: 200 }
      }
      return { data: session, error: 'Session not found', code: 404 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async deleteUserSession(sessionId: string) {
    try {
      const session = await this.prisma.session.findFirst({
        where: {
          id: sessionId
        }
      })
      if (session) {
        await this.prisma.session.delete({
          where: {
            id: sessionId
          }
        })
      }
    } catch (error: any) {
      console.log({ error });
    }
  }

  async deleteAllUserSessions(userId: string) {
    try {
      const sessionIds = (await this.prisma.session.findMany({
        where: {
          userId
        },
        select: {
          id: true
        }
      })).map(x => x.id)
      const deleted = await this.prisma.session.deleteMany({
        where: {
          userId
        }
      })
      console.log({ deleted });
      return { data: sessionIds, error: null, code: 201 }
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 }
    }
  }
}