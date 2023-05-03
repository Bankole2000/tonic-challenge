import { Request, Response, NextFunction } from 'express';
import { AccountStatus, UserRoles } from '@prisma/client';
import { ServiceResponse } from '../../@types/ServiseReponse.type';
import { generateTokens, verifyToken } from '../../utils/helpers/jwt-utils';
import { config } from '../../utils/config';
import UserDBService from '../../services/v1/user.service';
import CacheService from '../../services/v1/cache.service';
import SessionDBService from '../../services/v1/session.service';

const userService = new UserDBService();
const sessionService = new SessionDBService();
const cacheService = new CacheService();

export const requireRole = (roles: UserRoles[]) => (req: Request, res: Response, next: NextFunction) => {
  const { user } = res.locals;
  if (!user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  const isAuthorized = roles.some((role) => user.roles.includes(role));
  if (!isAuthorized) {
    const sr = new ServiceResponse('Unauthorized', null, false, 403, 'Unauthorized', 'USER_NOT_AUTHORIZED', 'You do not have the role(s) or permission(s) to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const requireLoggedInUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.user) {
    const sr = new ServiceResponse(
      'Unauthenticated',
      null,
      false,
      401,
      'Unauthenticated',
      'USER_NOT_AUTHENTICATED',
      'You need to be Logged in to perform this action'
    );
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const requireAccountStatus = (requiredStatus: AccountStatus[]) => async (req: Request, res: Response, next: NextFunction) => {
  const { user } = res.locals;
  if (!user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  if (!requiredStatus.includes(user.accountStatus)) {
    const sr = new ServiceResponse('Incomplete Profile', null, false, 403, 'Unauthorized', 'USER_PROFILE_INCOMPLETE', 'You need to complete your profile to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const getUserIfLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    const refreshToken = req.cookies?.refreshToken ? req.cookies.refreshToken : req.headers['x-refresh-token'];

    if (!refreshToken) {
      res.locals.user = null;
      return next();
    }

    const { decoded: refreshDecoded } = await verifyToken(refreshToken);

    if (!refreshDecoded) {
      res.locals.user = null;
      return next();
    }

    const { data: existingUser } = await userService.findUserById(refreshDecoded.userId);

    if (!existingUser) {
      res.locals.user = null;
      return next();
    }

    const { data: cachedSession } = await cacheService.getUserSession(refreshDecoded.sessionId);

    if (!cachedSession) {
      res.locals.user = null;
      return next();
    }

    res.locals.user = existingUser;
    res.locals.session = cachedSession;
    const { error: tokenError, data: refreshedTokens } = await generateTokens({ userId: existingUser.id, sessionId: cachedSession.id });

    if (!refreshedTokens) {
      res.locals.user = null;
      return next();
    }
    res.cookie('accessToken', refreshedTokens.accessToken);
    // NOTE: We can keep the user logged in by updating the refresh token and cached session
    res.cookie('refreshToken', refreshedTokens.refreshToken);
    res.locals.newAccessToken = refreshedTokens.accessToken;
    return next();
  }

  const accessToken = token.split(' ')[1];
  const refreshToken = req.cookies?.refreshToken ? req.cookies.refreshToken : req.headers['x-refresh-token'];

  if (!accessToken) {
    res.locals.user = null;
    return next();
  }
  const {
    valid, decoded, error, expired
  } = await verifyToken(accessToken);

  if (decoded && valid) {
    const { data: existingUser } = await userService.findUserById(decoded.userId);

    if (!existingUser) {
      res.locals.user = null;
      return next();
    }

    const { data: sessionData, error: findSessionError } = await cacheService.getUserSession(decoded.sessionId);

    if (!sessionData) {
      res.locals.user = null;
      return next();
    }

    if (sessionData.userId === existingUser.id) {
      res.locals.user = existingUser;
      res.locals.session = sessionData;
      return next();
    }
    res.locals.user = null;
    return next();
  }

  if (!refreshToken) {
    res.locals.user = null;
    return next();
  }

  if (expired && refreshToken) {
    const { decoded: refreshDecoded } = await verifyToken(refreshToken);

    if (!refreshDecoded) {
      res.locals.user = null;
      return next();
    }

    const { data: existingUser } = await userService.findUserById(refreshDecoded.userId);

    if (!existingUser) {
      res.locals.user = null;
      return next();
    }

    const { data: existingSession } = await cacheService.getUserSession(refreshDecoded.sessionId);

    if (!existingSession) {
      res.locals.user = null;
      return next();
    }

    if (existingSession.userId !== existingUser.id) {
      res.locals.user = null;
      return next();
    }

    const { error: tokenError, data: refreshedTokens } = await generateTokens({ userId: existingUser.id, sessionId: existingSession.id });

    if (!refreshedTokens) {
      res.locals.user = null;
      return next();
    }

    res.locals.newAccessToken = refreshedTokens.accessToken;
    res.locals.user = existingUser;
    res.locals.session = existingSession;
    return next();
  }
  res.locals.user = null;
  return next();
};
