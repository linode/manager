import * as moment from 'moment';

export const isBefore = (d1: string, d2: string) => {
  return moment.utc(d1).isBefore(moment.utc(d2));
};

export const isAfter = (d1: string, d2: string) => {
  return moment.utc(d1).isAfter(moment.utc(d2));
};
