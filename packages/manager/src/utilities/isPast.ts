import { parseAPIDate } from '@akamai/compute-ui-core/datetime';

export const isPast =
  (a: string) =>
  (b: string): boolean =>
    parseAPIDate(b) >= parseAPIDate(a);
