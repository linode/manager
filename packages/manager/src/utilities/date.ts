import {DateTime} from 'luxon';
import {API_DATETIME_NO_TZ_FORMAT} from 'src/constants';


export const parseAPIDate = (date: string) => {
  return DateTime.fromFormat(date, API_DATETIME_NO_TZ_FORMAT, {zone:'utc'})
}

/**
 * @returns a valid Luxon date if the format is API or ISO, Null if not
 * @param date date in either ISO 8606 (2019-01-02T12:34:42+00 or API format 2019-01-02 12:34:42
 */
export const parseISOOrAPIDate = (date: string)=>{
  const date1 = parseAPIDate(date);
  if(date1.isValid){
    return date1;
  }
  const date2 = DateTime.fromISO(date);
  if (date2.isValid){
    return date2;
  }
  throw new Error(`invalid date format: ${date}`);
}
export const isBefore = (d1: string, d2: string) => {
  return DateTime.fromISO(d1)<DateTime.fromISO(d2);
};

export const isAfter = (d1: string, d2: string) => {
  const date1 = parseISOOrAPIDate(d1);
  const date2 = parseISOOrAPIDate(d2);
  const res= date1>date2;
  return res;
};

