import { ServiceResponse } from "../@types/ServiseReponse.type";
import { Request, Response } from "express";

export const defaultHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not implemented', null, true, 200, null, null, null, null);
  console.log({ locals: res.locals });
  return res.status(sr.statusCode).send(sr);
}

export const healthCheckHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Health Check', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
}

export const routeNotFoundHandler = async (req: Request, res: Response) => {
  console.log({ req });
  const sr = new ServiceResponse('Route not found', null, false, 404, 'Not found', `Cannot ${req.method} ${req.originalUrl}`, 'Check that endpoint exists and has a handler');
  return res.status(sr.statusCode).send(sr);
}

export const fizzBuzzHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('FizzBuzz', null, true, 200, null, null, null, null);
  return res.status(sr.statusCode).send(sr);
}