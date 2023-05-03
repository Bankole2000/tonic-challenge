import { NextFunction, Request, Response } from 'express';
import { ServiceResponse } from '../../@types/ServiseReponse.type';
import AccountDBService from '../../services/v1/account.service';
import { serverErrorMessage } from '../../utils/helpers/utilityFxns';
import { isValidObjectId } from '../../utils/helpers/validators';

const accountService = new AccountDBService();

export const checkUserOwnsAccount = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = res.locals;
  const { accountId } = req.params;
  if (!isValidObjectId(accountId)) {
    const sr = new ServiceResponse(
      'Invalid Account Id',
      null,
      false,
      400,
      'INVALID_ACCOUNT_OBJECT_ID',
      'Invalid Account Id',
      'Check account Id and retry',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: accountExists, error, code } = await accountService.getAccountDetails(accountId);
  if (!accountExists) {
    const sr = code > 499 ? serverErrorMessage(error, code)
      : new ServiceResponse(
        'This account doesn\'t exist',
        null,
        false,
        404,
        'Account not found',
        error,
        'Check the account details and try again',
        res.locals.newAccessToken
      );
    return res.status(sr.statusCode).send(sr);
  }
  if (user.id !== accountExists.userId) {
    const sr = new ServiceResponse(
      'This is not your account',
      null,
      false,
      403,
      'You can only perform this action on your own account',
      'NOT_USER_ACCOUNT',
      'Check the account details and try again',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const checkSufficientBalance = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = res.locals;
  const { amount } = req.body;
  const { accountId } = req.params;
  if (!isValidObjectId(accountId)) {
    const sr = new ServiceResponse(
      'Invalid Account Id',
      null,
      false,
      400,
      'INVALID_ACCOUNT_OBJECT_ID',
      'Invalid Account Id',
      'Check account Id and retry',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: accountExists, error, code } = await accountService.getAccountDetails(accountId);
  if (!accountExists) {
    const sr = code > 499 ? serverErrorMessage(error, code)
      : new ServiceResponse(
        'This account doesn\'t exist',
        null,
        false,
        404,
        'Account not found',
        error,
        'Check the account details and try again',
        res.locals.newAccessToken
      );
    return res.status(sr.statusCode).send(sr);
  }
  if (user.id !== accountExists.userId) {
    const sr = new ServiceResponse(
      'This is not your account',
      null,
      false,
      403,
      'You can only perform this action on your own account',
      'NOT_USER_ACCOUNT',
      'Check the account details and try again',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  if (accountExists.balance - amount < 0) {
    const sr = new ServiceResponse(
      'Insufficient Funds',
      null,
      false,
      400,
      'Insufficient Funds',
      'ACCOUNT_INSUFFICIENT_BALANCE',
      'Please fund this account to perform this operation',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
