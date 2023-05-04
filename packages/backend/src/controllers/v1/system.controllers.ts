import { UserRoles } from '@prisma/client';
import { Request, Response } from 'express';
import { ServiceResponse } from '../../@types/ServiseReponse.type';
import SystemDBService from '../../services/v1/system.service';

const systemService = new SystemDBService();

export const getBanksHandler = async (req: Request, res: Response) => {
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
      data, error, code
    } = await systemService.searchBanks(searchTerm as string, page, limit);
    const sr = new ServiceResponse(
      'Bank search results',
      data,
      !error,
      code,
      error ? 'Error Searching banks' : null,
      error,
      error ? 'Check logs and database' : null,
      res.locals.newAccessToken
    );
    return res.status(sr.statusCode).send(sr);
  }
  const { data, error, code } = await systemService.getBanks(page, limit);
  const sr = new ServiceResponse(
    'Banks',
    data,
    !error,
    code,
    error ? 'Error Fetching banks' : null,
    error,
    error ? 'Check logs and database' : null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
};

export const getRolesHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse(
    'User Roles',
    Object.values(UserRoles),
    true,
    200,
    null,
    null,
    null,
    res.locals.newAccessToken
  );
  return res.status(sr.statusCode).send(sr);
};
