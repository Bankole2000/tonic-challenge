import { Request, Response } from 'express';
import { ServiceResponse } from '../@types/ServiseReponse.type';

export const defaultHandler = async (_req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const healthCheckHandler = async (_req: Request, res: Response) => {
  const sr = new ServiceResponse('Health Check', null, true, 200, null, null, null,);
  return res.status(sr.statusCode).send(sr);
};

export const routeNotFoundHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Route not found', null, false, 404, 'Not found', `Cannot ${req.method} ${req.originalUrl}`, 'Check that endpoint exists and has a handler');
  return res.status(sr.statusCode).send(sr);
};

export const welcomeRouteHandler = async (_req: Request, res: Response) => {
  const sr = new ServiceResponse('Welcome to the tonic technologies demo api', {
    github: 'https://github.com/Bankole2000/tonic-challenge',
    demo: 'https://tonic-backend-api.up.railway.app'
  }, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const fizzBuzzHandler = async (req: Request, res: Response) => {
  const { q: queryNumber } = req.query;
  let count: number;
  if (parseInt(queryNumber as string, 10)) {
    count = parseInt(queryNumber as string, 10);
  } else {
    count = 100;
  }
  const fizzBuzz = (num: number) => {
    let output = '';
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= num; i++) {
      const isFizz = i % 3 === 0;
      const isBuzz = i % 5 === 0;
      // eslint-disable-next-line no-nested-ternary
      output += isFizz ? (isBuzz ? 'FizzBuzz, ' : 'Fizz, ') : (isBuzz ? 'Buzz, ' : `${i}, `);
    }
    return output.trim().slice(0, -1);
  };
  const result = fizzBuzz(count);
  return res.status(200).send(result);
};
