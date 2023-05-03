import { Request, Response } from 'express';
import { Prisma, UserRoles } from '@prisma/client';
import { ServiceResponse } from '../../@types/ServiseReponse.type';
import UserDBService from '../../services/v1/user.service';
import { generateTokens, hashPassword, passwordsMatch } from '../../utils/helpers/jwt-utils';
import { config } from '../../utils/config';
import { serverErrorMessage } from '../../utils/helpers/utilityFxns';
import SessionDBService from '../../services/v1/session.service';
import CacheService from '../../services/v1/cache.service';
import { isValidObjectId } from '../../utils/helpers/validators';

const userService = new UserDBService();
const sessionService = new SessionDBService();

export const loginHandler = async (req: Request, res: Response) => {
  const cacheService = new CacheService();
  const { email, password } = req.body;
  const { data: existingUser, error: findUserError, code } = await userService.findUserByEmail(email);
  if (!existingUser) {
    if (code !== 404) {
      const sr = serverErrorMessage(findUserError, code);
      return res.status(sr.statusCode).send(sr);
    }
    const sr = new ServiceResponse(
      'This email is not registered',
      null,
      false,
      code,
      'EMAIL_NOT_REGISTERED',
      findUserError,
      'You can only login with a registered email'
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { password: hashedPassword } = existingUser;
  if (!passwordsMatch(password, hashedPassword)) {
    const sr = new ServiceResponse(
      'Incorrect email and password',
      null,
      false,
      400,
      'INVALID_EMAIL_AND_PASSWORD',
      'Incorrect email and password',
      'Enter your correct email and password'
    );
    return res.status(sr.statusCode).send(sr);
  }

  const { data: newSession, error: createSessionError, code: createSessionStatusCode } = await sessionService.createUserSession(existingUser.id);
  if (!newSession) {
    const sr = code > 499
      ? serverErrorMessage(createSessionError, createSessionStatusCode)
      : new ServiceResponse(
        'An error occured while registering your account',
        null,
        false,
        createSessionStatusCode,
        'Error Creating User Session',
        createSessionError,
        'Please check inputs'
      );
    return res.status(sr.statusCode).send(sr);
  }
  const { error: tokenError, data: tokens } = await generateTokens({ userId: existingUser.id, sessionId: newSession.id });

  if (!tokens) {
    console.log({ tokenError });
    const sr = serverErrorMessage(tokenError, 500);
    return res.status(sr.statusCode).send(sr);
  }

  await cacheService.cacheUserSession(newSession.id, newSession);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    maxAge: parseInt(config.self.refreshTokenTTLMS || '86400000', 10),
  });

  const { password: _, ...user } = existingUser;

  const sr = new ServiceResponse('Login Successful', { ...tokens, user }, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const registerHandler = async (req: Request, res: Response) => {
  const cacheService = new CacheService();
  const { email, password, tos } = req.body;
  const { data: existingUser, error: findUserError, code } = await userService.findUserByEmail(email);
  if (existingUser) {
    const sr = new ServiceResponse('This email is already registered', null, false, 400, 'EMAIL_ALREADY_REGISTERED', 'EMAIL_ALREADY_REGISTERED', 'Please register with a new email account');
    return res.status(sr.statusCode).send(sr);
  }
  if (code !== 404) {
    const sr = serverErrorMessage(findUserError, code);
    return res.status(sr.statusCode).send(sr);
  }
  const hashedPassword = hashPassword(password);
  const userData: Prisma.UserCreateInput = { email, password: hashedPassword, tos };
  if (userData.email === config.self.adminEmail) {
    userData.roles = Object.keys(UserRoles) as UserRoles[];
  }
  const { data: newUser, error: createUserError, code: createUserStatusCode } = await userService.createUser(userData);
  if (!newUser) {
    const sr = code > 499
      ? serverErrorMessage(createUserError, createUserStatusCode)
      : new ServiceResponse(
        'An error occured in creating your account',
        null,
        false,
        createUserStatusCode,
        createUserError,
        createUserError,
        'Please check inputs'
      );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: newSession, error: createSessionError, code: createSessionStatusCode } = await sessionService.createUserSession(newUser.id);

  if (!newSession) {
    const sr = code > 499
      ? serverErrorMessage(createSessionError, createSessionStatusCode)
      : new ServiceResponse(
        'An error occured while registering your account',
        null,
        false,
        createSessionStatusCode,
        'Error Creating User Session',
        createUserError,
        'Please check inputs'
      );
    return res.status(sr.statusCode).send(sr);
  }

  const { error: tokenError, data: tokens } = await generateTokens({ userId: newUser.id, sessionId: newSession.id });

  if (!tokens) {
    console.log({ tokenError });
    const sr = serverErrorMessage(tokenError, 500);
    return res.status(sr.statusCode).send(sr);
  }

  await cacheService.cacheUserSession(newSession.id, newSession);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    maxAge: parseInt(config.self.refreshTokenTTLMS || '604800000', 10),
  });

  const { password: _, ...user } = newUser;

  const sr = new ServiceResponse('Registration Successful', { ...tokens, user }, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const loggedInUserHandler = async (req: Request, res: Response) => {
  const { user: userData, session: sessionData } = res.locals;
  if (userData && sessionData) {
    const { password: _, ...user } = userData;
    const { user: __, ...session } = sessionData;
    const sr = new ServiceResponse(
      `Logged in as ${user.email}`,
      {
        user,
        session,
      },
      true,
      200,
      null,
      null,
      null,
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse(
    'Not Logged in',
    null,
    false,
    401,
    null,
    null,
    null,
  );
  return res.status(sr.statusCode).send(sr);
};

export const logoutHandler = async (req: Request, res: Response) => {
  const cacheService = new CacheService();
  if (res.locals.session) {
    cacheService.deleteUserSession(res.locals.session.id);
    sessionService.deleteUserSession(res.locals.session.id);
  }
  res.clearCookie('refreshToken');
  const sr = new ServiceResponse('You have been logged out', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};
