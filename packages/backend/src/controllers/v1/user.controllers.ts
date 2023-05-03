import { Request, Response } from "express";
import { ServiceResponse } from "../../@types/ServiseReponse.type";
import { updateProfileFields } from "../../utils/validators/user.schema";
import UserDBService from "../../services/v1/user.service";
import SessionDBService from "../../services/v1/session.service";
import CacheService from "../../services/v1/cache.service";
import AccountDBService from "../../services/v1/account.service";
import { serverErrorMessage } from "../../utils/helpers/utilityFxns";
import { getIO } from "../../lib/socketIO";
import { socketEventTypes } from "../../utils/validators/socketEvents.schema";
import { isValidDate } from "../../utils/helpers/validators";

const sessionService = new SessionDBService();
const userService = new UserDBService();
const accountService = new AccountDBService();

export const getUserAccountsHandler = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { data, error, code } = await userService.getUserAccounts(user.id);
  if (error) {
    const sr = new ServiceResponse(
      `Error getting user accounts`,
      data,
      false,
      code,
      'FETCH_USER_ACCOUNTS_ERROR',
      error,
      'Please contact support'
    )
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
}

export const createNewAccountHandler = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { accountNumber, bankId } = req.body;
  const { data: existingAccount, error } = await accountService.findBankAccount(bankId, accountNumber);
  if (existingAccount) {
    console.log({ error });
    const sr = new ServiceResponse(
      `This Account Number with ${existingAccount.bank.name} is already taken`,
      null,
      false,
      400,
      'Bank Account number already assigned',
      'BANK_ACCOUNT_NUMBER_ALREADY_ASSIGNED',
      'Please check account details and try again',
      res.locals.newAccessToken
    )
    return res.status(sr.statusCode).send(sr);
  }
  const { data: newAccount, error: accountCreateError, code: accountCreateStatusCode } = await accountService.createUserAccount(accountNumber, bankId, user.id);
  if (!newAccount) {
    const sr = new ServiceResponse(
      `There was an error creating your account`,
      newAccount,
      false,
      accountCreateStatusCode,
      'ACCOUNT_CREATE_ERROR',
      accountCreateError,
      accountCreateStatusCode === 500 ? 'Please contact support' : 'Check account creation inputs',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: updatedProfileStatus, code: profileStatusCode } = await userService.setUserAccountStatus(user.id);
  if (profileStatusCode === 201 && updatedProfileStatus) {
    const { data: updatedSession } = await sessionService.getUserSession(res.locals.session.id, user.id)
    if (updatedSession) {
      const cacheService = new CacheService()
      await cacheService.cacheUserSession(updatedSession.id, updatedSession);
      const { password: _, ...profile } = updatedProfileStatus;
      getIO().to(user.id).emit(socketEventTypes.PROFILE_UPDATED, profile);
    }
  }
  const sr = new ServiceResponse(
    `Account created successfully`,
    newAccount,
    true,
    accountCreateStatusCode,
    null,
    null,
    null,
    res.locals.newAccessToken
  )
  return res.status(sr.statusCode).send(sr);
};

export const deleteAccountHandler = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { accountId } = req.params;
  const { data: deletedAccount, error, code } = await accountService.deleteUserAccount(accountId);
  if (!deletedAccount) {
    const sr = code > 499
      ? serverErrorMessage(error, code)
      : new ServiceResponse(
        `Error deleting account`,
        deletedAccount,
        false,
        code,
        'Error deleting account',
        error,
        'Check account Id',
        res.locals.newAccessToken
      )
    res.status(sr.statusCode).send(sr);
  }
  const { data: updatedProfileStatus, code: profileStatusCode } = await userService.setUserAccountStatus(user.id);
  if (profileStatusCode === 201 && updatedProfileStatus) {
    const { data: updatedSession } = await sessionService.getUserSession(res.locals.session.id, user.id)
    if (updatedSession) {
      const cacheService = new CacheService()
      await cacheService.cacheUserSession(updatedSession.id, updatedSession);
      const { password: _, ...profile } = updatedProfileStatus;
      getIO().to(user.id).emit(socketEventTypes.PROFILE_UPDATED, profile);
    }
  }
  const sr = new ServiceResponse(
    'Bank account deleted Successfully',
    deletedAccount,
    true,
    201,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
}

export const addBeneficiaryAccountHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  console.log({ locals: res.locals });
  return res.status(sr.statusCode).send(sr);
}

export const removeBeneficiaryAccountHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  console.log({ locals: res.locals });
  return res.status(sr.statusCode).send(sr);
}

export const updateProfileHandler = async (req: Request, res: Response) => {
  const profileData: { [key: string]: any } = {};
  updateProfileFields.forEach(field => {
    if (req.body[field]) {
      profileData[field] = req.body[field]
    }
  })
  const { data: updatedProfile, error: profileUpdateError, code: profileUpdateStatusCode } = await userService.updateUserProfile(res.locals.user.id, profileData);
  if (!updatedProfile) {
    const sr = new ServiceResponse(
      `There was an error updating your profile`,
      updatedProfile,
      false,
      profileUpdateStatusCode,
      'PROFILE_UPDATE_ERROR',
      profileUpdateError,
      profileUpdateStatusCode === 500 ? 'Please contact support' : 'Please check inputs and try again',
      res.locals.newAccessToken
    )
    return res.status(sr.statusCode).send(sr);
  }
  const { data: updatedProfileStatus, code: profileStatusCode, error: profileStatusError } = await userService.setUserAccountStatus(res.locals.user.id);
  if (!updatedProfileStatus) {
    const sr = new ServiceResponse(
      `There was an error updating your profile`,
      updatedProfileStatus,
      false,
      profileStatusCode,
      'PROFILE_STATUS_ERROR',
      profileStatusError,
      profileStatusCode === 500 ? 'Please contact support' : 'Please check inputs and try again',
      res.locals.newAccessToken
    )
    return res.status(sr.statusCode).send(sr);
  }
  if (profileStatusCode === 201) {
    const { data: updatedSession } = await sessionService.getUserSession(res.locals.session.id, res.locals.user.id)
    if (updatedSession) {
      const cacheService = new CacheService()
      await cacheService.cacheUserSession(updatedSession.id, updatedSession);
    }
  }
  const { password: _, ...user } = updatedProfileStatus;
  const sr = new ServiceResponse(
    'Profile Updated',
    user,
    true,
    profileStatusCode,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
}

export const getUserTransactionsHandler = async (req: Request, res: Response) => {
  const { user } = res.locals
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
    const { data: searchResults, error, code } = await userService.searchUserTransactions(user.id, fromDate, toDate, page, limit);
    const sr = code > 299
      ? serverErrorMessage(error, code)
      : new ServiceResponse(
        `Transaction search results`,
        searchResults,
        true,
        code,
        null,
        null,
        null,
        res.locals.newAccessToken
      )
    return res.status(sr.statusCode).send(sr);
  }
  const { data: results, error, code } = await userService.getUserTransactions(user.id, page, limit);
  const sr = code > 299
    ? serverErrorMessage(error, code)
    : new ServiceResponse(
      `Transactions results`,
      results,
      true,
      code,
      null,
      null,
      null,
      res.locals.newAccessToken
    )
  return res.status(sr.statusCode).send(sr);
}