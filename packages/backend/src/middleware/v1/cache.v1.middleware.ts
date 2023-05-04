import { Request, Response, NextFunction } from 'express';
import CacheService from '../../services/v1/cache.service';
import { ServiceResponse } from '../../@types/ServiseReponse.type';

const cacheService = new CacheService();

export const getFromCache = async (req: Request, res: Response, next: NextFunction) => {
  const { data } = await cacheService.getCachedRequest(req.originalUrl);
  if (data) {
    res.status(data.statusCode).send(data);
  }
  return next();
};

export const preventDuplicateTxn = async (req: Request, res: Response, next: NextFunction) => {
  const { accountId: originAccountId } = req.params;
  const { destinationAccountId, amount } = req.body;
  const {
    data
  } = await cacheService
    .getCachedTransferTxn(originAccountId, destinationAccountId ?? null, amount);
  if (data) {
    const sr = new ServiceResponse(
      'Duplicate Transaction detected - Please try again after some time',
      null,
      false,
      429,
      'Duplicate Transaction',
      'DUPLICATE_TRANSACTION',
      'Please try again after about 10 seconds',
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
