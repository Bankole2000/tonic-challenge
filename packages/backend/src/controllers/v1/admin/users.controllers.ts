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
import { isValidDate } from '../../../utils/helpers/validators';
import { config } from '../../../utils/config';

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
  const {
    data: updatedProfile, error: profileUpdateError, code: profileUpdateStatusCode
  } = await userService.updateUserProfile(userId, profileData);
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
  const {
    data: updatedProfileStatus, code: profileStatusCode, error: profileStatusError
  } = await userService.setUserAccountStatus(userId);
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
  const { password: _, ...user } = userData;
  if (currentRoles.includes(role)) {
    const sr = new ServiceResponse(
      'User already has this role',
      user,
      true,
      200,
      null,
      null,
      null,
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const newRoles = Array.from(new Set([...currentRoles, role]));
  const {
    data: updatedUser, error: roleUpdateError, code: roleUpdateStatusCode
  } = await adminService.setUserRoles(userId, newRoles as UserRoles[]);
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
  const { userId } = req.params;
  const { password } = req.body;
  const hashedPassword = hashPassword(password);
  const {
    data: result, error, code
  } = await userService.updateUserProfile(userId, { password: hashedPassword });
  if (!result) {
    const sr = code > 499
      ? serverErrorMessage(error, code)
      : new ServiceResponse(
        'Error updating user password',
        result,
        false,
        code,
        'Error updating user password',
        error,
        'Check inputs and try again',
        res.locals.newAccessToken
      );
    return res.status(sr.statusCode).send(sr);
  }
  const { password: _, ...user } = result;
  const sr = new ServiceResponse(
    'User password updated',
    user,
    true,
    code,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
};

export const adminRemoveUserRoleHandler = async (req: Request, res: Response) => {
  const { userId, role } = req.params;
  if (!role || !Object.values(UserRoles).includes(role as UserRoles)) {
    const sr = new ServiceResponse(
      'Invalid role to remove',
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
  const { password: _, ...user } = userData;
  if (user.email === config.self.adminEmail) {
    const sr = new ServiceResponse(
      'This user\'s roles cannot be changed',
      user,
      false,
      400,
      'User roles unchangeable',
      'User roles unchangeable',
      'Contact support',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const currentRoles = userData.roles;
  if (!currentRoles.includes(role as UserRoles)) {
    const sr = new ServiceResponse(
      'This user does not have this role',
      user,
      false,
      400,
      'User does not have role specified',
      'Error removing user role',
      'Check that the user has the role then try again',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const newRoles = currentRoles.filter((r) => r !== role);
  const {
    data: updatedUser, error: roleUpdateError, code: roleUpdateStatusCode
  } = await adminService.setUserRoles(userId, newRoles as UserRoles[]);
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
    'Role removed from user',
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

export const adminDeleteUserHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
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
  const { password: _, ...user } = userData;
  if (userData.email === config.self.adminEmail && res.locals.user.id !== userData.id) {
    const sr = new ServiceResponse(
      'This user cannot be deleted by anyone else',
      user,
      false,
      400,
      'User is super user',
      'User is super user',
      'Contact support',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const {
    data: deletedUser, error, code
  } = await userService.deleteUser(userId);
  if (error) {
    const sr = code > 499
      ? serverErrorMessage(error, code)
      : new ServiceResponse(
        'Error deleting user',
        deletedUser,
        false,
        code,
        'Error deleting user',
        error,
        'Check inputs, logs and database',
        res.locals.newAccessToken
      );
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse(
    'User deleted',
    deletedUser,
    true,
    code,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
};

export const adminGetUserAccountsHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { data, error, code } = await userService.getUserAccounts(userId);
  if (error) {
    const sr = new ServiceResponse(
      'Error getting user accounts',
      data,
      false,
      code,
      'FETCH_USER_ACCOUNTS_ERROR',
      error,
      'Please contact support'
    );
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse(
    'User Accounts',
    data,
    true,
    code,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
};

export const adminGetUserTransactionsHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 25;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const { from, to } = req.query;
  let fromDate;
  if (!from || !isValidDate(from as string)) {
    fromDate = null;
  } else {
    fromDate = new Date(from as string).toISOString();
  }
  let toDate;
  if (!to || !isValidDate(to as string)) {
    toDate = new Date().toISOString();
  } else {
    toDate = new Date(to as string).toISOString();
  }
  if (fromDate) {
    const {
      data: searchResults, error, code
    } = await userService.searchUserTransactions(userId, fromDate, toDate, page, limit);
    const sr = code > 299
      ? serverErrorMessage(error, code)
      : new ServiceResponse(
        'User Transaction search results',
        searchResults,
        true,
        code,
        null,
        null,
        null,
        res.locals.newAccessToken
      );
    return res.status(sr.statusCode).send(sr);
  }
  const {
    data: results, error, code
  } = await userService.getUserTransactions(userId, page, limit);
  const sr = code > 299
    ? serverErrorMessage(error, code)
    : new ServiceResponse(
      'User Transactions',
      results,
      true,
      code,
      null,
      null,
      null,
      res.locals.newAccessToken
    );
  return res.status(sr.statusCode).send(sr);
};
