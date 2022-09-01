import { parseAPIDate } from './date';

export default (a: string) => (b: string): boolean =>
  parseAPIDate(b) >= parseAPIDate(a);
