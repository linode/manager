import {DateTime} from 'luxon'
export const formatDate = (utcDate: string, showTime?: boolean) => {
  const formattedDate = DateTime.fromISO(utcDate).toISO();
  const startOfTimeStamp = formattedDate.indexOf('T'); // beginning of timestamp
  if (!!showTime) {
    return formattedDate.replace('T', ' ').replace('.000Z', '');
  }
  return formattedDate.substring(0, startOfTimeStamp);
};
