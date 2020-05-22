import {DateTime} from 'luxon'
export const isBefore = (d1: string, d2: string) => {
  return DateTime.fromISO(d1)<DateTime.fromISO(d2);
};

export const isAfter = (d1: string, d2: string) => {
  return DateTime.fromISO(d1)>DateTime.fromISO(d2);
};
