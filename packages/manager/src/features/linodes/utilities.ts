import { parseAPIDate } from 'src/utilities/date';

export const linodeMaintenanceWindowString = (date: string, time: string) => {
  const twoHoursLater = parseAPIDate(time)
    .plus({ hours: 2 })
    .toFormat('HH:mm:ss');

  return `${date} between ${time} and ${twoHoursLater}`;
};
