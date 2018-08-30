import * as moment from 'moment';

export const formatDate = (utcDate: string, showTime?: boolean) => {
  const formattedDate = moment.utc(utcDate).toISOString();
  const startOfTimeStamp = formattedDate.indexOf('T'); // beginning of timestamp
  if (!!showTime) {
    return formattedDate.replace('T', ' ').replace('.000Z', '');
  }
  return formattedDate.substring(0, startOfTimeStamp);
};
