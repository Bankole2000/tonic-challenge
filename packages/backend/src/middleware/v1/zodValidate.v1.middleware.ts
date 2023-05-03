import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { ServiceResponse } from '../../@types/ServiseReponse.type';

export const validate =
  (schema: AnyZodObject, schemaName = 'Input') => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      const sr = new ServiceResponse(
        `${schemaName} validation failed`,
        null,
        false,
        400,
        `Invalid ${schemaName} Data`,
        error.errors,
        'Check data in request body, query params and path params'
      );
      return res.status(sr.statusCode).send(sr);
    }
  };