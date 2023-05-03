// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const config = {
  self: {
    name: 'tonic-api',
    port: process.env.PORT,
    env: process.env.ENVIRONMENT,
    adminEmail: process.env.ADMIN_EMAIL,
    jwtSecret: process.env.JWT_SECRET,
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL,
    accessTokenTTLMS: process.env.ACCESS_TOKEN_TTL_MS,
    refreshTokenTTL: process.env.REFRESH_TOKEN_TTL,
    refreshTokenTTLMS: process.env.REFRESH_TOKEN_TTL_MS,
    txnCoolDown: process.env.TRANSACTION_COOLDOWN || 5,
  },
  mongodb: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL
  }
};
