import { parseAPIDate } from './date';

export const isPast =
  (a: string) =>
  (b: string): boolean =>
    parseAPIDate(b) >= parseAPIDate(a);
