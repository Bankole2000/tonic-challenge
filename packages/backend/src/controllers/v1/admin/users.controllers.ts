import { Request, Response } from 'express';
import { Prisma, UserRoles } from '@prisma/client';
import UserDBService from '../../../services/v1/user.service';
import { ServiceResponse } from '../../../@types/ServiseReponse.type';
import { serverErrorMessage } from '../../../utils/helpers/utilityFxns';
import { hashPassword } from '../../../utils/helpers/jwt-utils';
import { updateProfileFields } from '../../../utils/validators/user.schema';
import CacheService from '../../../services/v1/cache.service';
import SessionDBService from '../../../services/v1/session.service';
import { getIO } from '../../../lib/socketIO';
import { socketEventTypes } from '../../../utils/validators/socketEvents.schema';
import AdminDBService from '../../../services/v1/admin.service';

const userService = new UserDBService();
const sessionService = new SessionDBService();
const adminService = new AdminDBService();

export const adminAddUserHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const {
    data: existingUser,
    error: findUserError,
    code
  } = await userService.findUserByEmail(email);
  if (existingUser) {
    const sr = new ServiceResponse('This email is already registered', null, false, 400, 'EMAIL_ALREADY_REGISTERED', 'EMAIL_ALREADY_REGISTERED', 'Use a new email account to register the user');
    return res.status(sr.statusCode).send(sr);
  }
  if (code !== 404) {
    const sr = serverErrorMessage(findUserError, code);
    return res.status(sr.statusCode).send(sr);
  }
  const hashedPassword = hashPassword(password);
  const userData: Prisma.UserCreateInput = { email, password: hashedPassword, tos: true };
  const {
    data: newUser,
    error: createUserError,
    code: createUserStatusCode
  } = await userService.createUser(userData);
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
  const { password: _, ...user } = newUser;
  const sr = new ServiceResponse(
    'New user created',
    user,
    true,
    200,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
};

export const adminUpdateUserHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const profileData: { [key: string]: any } = {};
  updateProfileFields.forEach((field) => {
    if (req.body[field]) {
      profileData[field] = req.body[field];
    }
  });
  const { data: updatedProfile, error: profileUpdateError, code: profileUpdateStatusCode } = await userService.updateUserProfile(userId, profileData);
  if (!updatedProfile) {
    const sr = new ServiceResponse(
      'There was an error updating the user\'s profile',
      updatedProfile,
      false,
      profileUpdateStatusCode,
      'PROFILE_UPDATE_ERROR',
      profileUpdateError,
      profileUpdateStatusCode === 500 ? 'Please contact support' : 'Please check inputs and try again',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: updatedProfileStatus, code: profileStatusCode, error: profileStatusError } = await userService.setUserAccountStatus(userId);
  if (!updatedProfileStatus) {
    const sr = new ServiceResponse(
      'There was an error updating the user\'s profile',
      updatedProfileStatus,
      false,
      profileStatusCode,
      'PROFILE_STATUS_ERROR',
      profileStatusError,
      profileStatusCode === 500 ? 'Please contact support' : 'Please check inputs and try again',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { password: _, ...user } = updatedProfileStatus;
  if (profileStatusCode === 201) {
    const { data: deletedSessions } = await sessionService.deleteAllUserSessions(userId);
    if (deletedSessions?.length) {
      const cacheService = new CacheService();
      await cacheService.clearAllUserSessions(deletedSessions);
      getIO().to(userId).emit(socketEventTypes.LOGGED_OUT);
    }
  }
  const sr = new ServiceResponse(
    'User\'s Profile Updated',
    user,
    true,
    profileStatusCode,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
};

export const adminAddUserRoleHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!Object.values(UserRoles).includes(role)) {
    const sr = new ServiceResponse(
      'Invalid role to add',
      null,
      false,
      400,
      'Invalid role',
      'INVALID_ROLE',
      'Check the available roles and try again',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: userData } = await userService.findUserById(userId);
  if (!userData) {
    const sr = new ServiceResponse(
      'User not found',
      null,
      false,
      404,
      'User not found',
      'USER_NOT_FOUND',
      'Check the userId and try again',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const currentRoles = userData.roles;
  const newRoles = Array.from(new Set([...currentRoles, role]));
  const { data: updatedUser, error: roleUpdateError, code: roleUpdateStatusCode } = await adminService.setUserRoles(userId, newRoles as UserRoles[]);
  if (!updatedUser) {
    const sr = roleUpdateStatusCode > 499
      ? serverErrorMessage(roleUpdateError, roleUpdateStatusCode)
      : new ServiceResponse(
        'An error occured updating user role',
        updatedUser,
        false,
        roleUpdateStatusCode,
        'Error updating user role',
        roleUpdateError,
        'Check inputs and try again'
      );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: deletedSessions } = await sessionService.deleteAllUserSessions(userId);
  if (deletedSessions?.length) {
    const cacheService = new CacheService();
    await cacheService.clearAllUserSessions(deletedSessions);
    getIO().to(userId).emit(socketEventTypes.LOGGED_OUT);
  }

  const sr = new ServiceResponse(
    'Role successfully added to user',
    updatedUser,
    true,
    201,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
};

export const adminSetUserPasswordHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  console.log({ locals: res.locals });
  return res.status(sr.statusCode).send(sr);
};

export const adminRemoveUserRoleHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  console.log({ locals: res.locals });
  return res.status(sr.statusCode).send(sr);
};

export const adminDeleteUserHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  console.log({ locals: res.locals });
  return res.status(sr.statusCode).send(sr);
};

export const adminGetUserAccountsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  console.log({ locals: res.locals });
  return res.status(sr.statusCode).send(sr);
};

export const adminGetUserTransactionsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  console.log({ locals: res.locals });
  return res.status(sr.statusCode).send(sr);
};
