import { Request, Response, NextFunction } from 'express';
import { ServiceResponse } from '../../@types/ServiseReponse.type';
import { isValidObjectId } from '../../utils/helpers/validators';
import AccountDBService from '../../services/v1/account.service';
import UserDBService from '../../services/v1/user.service';
import { serverErrorMessage } from '../../utils/helpers/utilityFxns';

const accountService = new AccountDBService();
const userService = new UserDBService();

export const checkUserExists = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    const sr = new ServiceResponse(
      'Invalid User Id',
      null,
      false,
      400,
      'INVALID_USER_OBJECT_ID',
      'Invalid User Id',
      'Check User Id and retry',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { data: userExists, error, code } = await userService.findUserById(userId);
  if (!userExists) {
    const sr = code > 499 ? serverErrorMessage(error, code)
      : new ServiceResponse(
        'This User doesn\'t exist',
        null,
        false,
        404,
        'User not found',
        error,
        'Check the User details and try again',
        res.locals.newAccessToken
      );
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const checkAccountExists = async (req: Request, res: Response, next: NextFunction) => {
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
  return next();
};
