import { ServiceResponse } from '../../@types/ServiseReponse.type';

export const serverErrorMessage = (error: any, code: number) => new ServiceResponse(
  'An unexpected error occured',
  null,
  false,
  code,
  'SERVER_ERROR',
  error,
  'Please contact support'
);
