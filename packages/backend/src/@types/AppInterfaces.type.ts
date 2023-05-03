export interface AppResponse {
  message: string;
  success: boolean;
  data?: any;
  errors?: any;
  error: string | undefined | null;
  statusCode: number;
}