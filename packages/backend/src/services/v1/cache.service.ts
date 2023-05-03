import { Session } from '@prisma/client';
import { config } from '../../utils/config';
import { connectRedis, RedisConnection } from '../../lib/redis';

export default class CacheService {
  redis: RedisConnection;

  constructor() {
    this.redis = connectRedis();
  }

  async cacheUserSession(sessionId: string, sessionData: Session) {
    try {
      const sessionExpiration = parseInt(config.self.refreshTokenTTLMS as string, 10) / 1000;
      console.log({ sessionExpiration });
      const sessionKey = `${config.self.name}:session:${sessionId}`;
      await this.redis.connect();
      await this.redis.setEx(sessionKey, sessionExpiration, JSON.stringify(sessionData));
      await this.redis.disconnect();
    } catch (error: any) {
      console.log({ error });
    }
  }

  async cacheRequest(reqUrl: string, data: any) {
    try {
      const cacheExpiration = parseInt(config.self.accessTokenTTLMS as string, 10) / 1000;
      const reqKey = `${config.self.name}:cache:${reqUrl}`;
      await this.redis.connect();
      await this.redis.setEx(reqKey, cacheExpiration, JSON.stringify(data));
      await this.redis.disconnect();
    } catch (error: any) {
      console.log({ error });
    }
  }

  async cacheTransferTxn(origin: string, destination: string | null, amount: number) {
    try {
      const cacheExpiration = parseInt(config.self.txnCoolDown as string, 10);
      console.log({ cacheExpiration });
      const txnKey = `${config.self.name}:txn:${origin}:${destination}:${amount}`;
      console.log({ set: txnKey });
      await this.redis.connect();
      await this.redis.setEx(txnKey, cacheExpiration, JSON.stringify({ origin, destination, amount }));
      await this.redis.disconnect();
    } catch (error) {
      console.log({ error });
    }
  }

  async getCachedTransferTxn(origin: string, destination: string | null, amount: number) {
    try {
      const txnKey = `${config.self.name}:txn:${origin}:${destination}:${amount}`;
      console.log({ get: txnKey });
      await this.redis.connect();
      const data = await this.redis.get(txnKey);
      await this.redis.disconnect();
      if (data) {
        return { data: JSON.parse(data), error: null, code: 200 };
      }
      return { data: null, error: 'Txn not found', code: 404 };
    } catch (error) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async getCachedRequest(reqUrl: string) {
    try {
      const reqKey = `${config.self.name}:cache:${reqUrl}`;
      await this.redis.connect();
      const data = await this.redis.get(reqKey);
      await this.redis.disconnect();
      if (data) {
        return { data: JSON.parse(data), error: null, code: 200 };
      }
      return { data: null, error: 'Request not found', code: 404 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async getUserSession(sessionId: string) {
    try {
      const sessionKey = `${config.self.name}:session:${sessionId}`;
      await this.redis.connect();
      const sessionData = await this.redis.get(sessionKey);
      await this.redis.disconnect();
      if (sessionData) {
        return { data: JSON.parse(sessionData), error: null, code: 200 };
      }
      return { data: null, error: 'Session not found', code: 404 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async deleteUserSession(sessionId: string) {
    try {
      const sessionKey = `${config.self.name}:session:${sessionId}`;
      await this.redis.connect();
      const session = await this.redis.del(sessionKey);
      await this.redis.disconnect();
      return { data: session, error: null, code: 201 };
    } catch (error: any) {
      console.log({ error });
      return { data: null, error, code: 500 };
    }
  }

  async clearAllUserSessions(sessionIds: string[]) {
    try {
      const sessionKeys = sessionIds.map((id) => `${config.self.name}:session:${id}`);
      await this.redis.connect();
      await this.redis.del(sessionKeys);
      await this.redis.disconnect();
    } catch (error) {
      console.log({ error });
    }
  }
}
