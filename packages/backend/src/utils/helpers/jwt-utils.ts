import JWT from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export const passwordsMatch = (
  attemptedPassword: string,
  hashedPassword: string
) => bcrypt.compareSync(attemptedPassword, hashedPassword);

export const signJWT = async (
  payload: any,
  secret: string,
  options?: JWT.SignOptions | undefined
) => {
  try {
    return {
      error: null,
      token: JWT.sign(payload, secret, { ...(options && options) }),
    };
  } catch (error: any) {
    return {
      error,
      token: null,
    };
  }
};

export const verifyToken = async (token: string) => {
  if (!token) {
    return {
      error: 'No token provided',
      decoded: null,
      valid: false,
      expired: false,
    };
  }
  const secret = config.self.jwtSecret as string;
  try {
    const decoded = JWT.verify(token, secret);
    return {
      error: null,
      decoded: decoded as JWT.JwtPayload,
      valid: true,
      expired: false,
    };
  } catch (error: any) {
    return {
      error,
      decoded: null,
      valid: false,
      expired: error.message === 'jwt expired'
    };
  }
};

export const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
};

export const generateTokens = async (payload: any) => {
  const secret = config.self.jwtSecret || '';
  const accessTTL = config.self.accessTokenTTL;
  const refreshTTL = config.self.refreshTokenTTL;
  try {
    return {
      error: null,
      data: {
        accessToken: JWT.sign(payload, secret, { expiresIn: accessTTL }),
        refreshToken: JWT.sign(payload, secret, { expiresIn: refreshTTL }),
      }
    };
  } catch (error: any) {
    console.log({ error });
    return {
      error,
      data: null
    };
  }
};
