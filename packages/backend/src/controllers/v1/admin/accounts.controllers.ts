import { Request, Response } from 'express';
import { ServiceResponse } from '../../../@types/ServiseReponse.type';

export const adminGetAccountsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
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
