import { Request } from 'express';
export interface TokenRequest extends Request {
  token: string;
}
