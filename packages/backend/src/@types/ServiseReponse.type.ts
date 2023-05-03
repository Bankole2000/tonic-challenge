import { AppResponse } from './AppInterfaces.type';

export class ServiceResponse implements AppResponse {
  message: string;

  success: boolean;

  data?: any;

  errors?: unknown;

  fix?: string | undefined | null;

  newAccessToken?: string | undefined | null;

  error: string | undefined | null;

  statusCode: number;

  constructor(
    message: string,
    data: any,
    success: boolean,
    statusCode: number,
    error: string | undefined | null,
    errors?: any,
    fix?: string | undefined | null,
    newAccessToken?: string | undefined | null
  ) {
    this.message = message;
    this.success = success;
    this.data = data;
    this.errors = errors;
    this.error = error;
    this.fix = fix;
    this.statusCode = statusCode;
    this.newAccessToken = newAccessToken;
  }
}
