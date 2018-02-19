import moment from 'moment';

export function lessThanDatetimeFilter(key, datetime) {
  return {
    [key]: {
      '+lt': datetime,
    },
  };
}

export function lessThanNowFilter(key) {
  return lessThanDatetimeFilter(key, moment().toISOString());
}
