import { Request, Response } from 'express';
import { serverErrorMessage } from '../../../utils/helpers/utilityFxns';
import AccountDBService from '../../../services/v1/account.service';
import { ServiceResponse } from '../../../@types/ServiseReponse.type';

const accountService = new AccountDBService();

export const adminGetAccountsHandler = async (req: Request, res: Response) => {
  const { q: searchTerm } = req.query;
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
  if (searchTerm) {
    const {
      data: searchResults, error, code
    } = await accountService.searchAllAccounts(searchTerm as string, page, limit);
    if (error) {
      const sr = code > 499
        ? serverErrorMessage(error, code)
        : new ServiceResponse(
          'An error occured searching accounts',
          null,
          false,
          code,
          error ?? 'Search Accounts error',
          error,
          'Check logs and database',
          res.locals.newAccessToken
        );
      return res.status(sr.statusCode).send(sr);
    }
    const sr = new ServiceResponse(
      'Account search results',
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
  const { data: results, error, code } = await accountService.getAllAccounts(page, limit);
  const sr = error
    ? serverErrorMessage(error, code)
    : new ServiceResponse(
      'User Accounts',
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

export const adminFindAccountHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminCreateAccountForUserHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminDeleteUserAccountHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminDepositIntoAccountHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminWithdrawFromAccountHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminGetAccountTransactionsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminTransferBetweenAccountsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminReverseTransferHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminGetTransactionsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const adminReverseTransaction = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
};
