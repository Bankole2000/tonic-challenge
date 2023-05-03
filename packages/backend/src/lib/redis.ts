import { createClient } from 'redis';
import { config } from '../utils/config';

export const connectRedis = () => {
  return createClient({ url: config.redis.url });
}

export type RedisConnection = ReturnType<typeof connectRedis>;
