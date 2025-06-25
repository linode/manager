import { DateTime } from 'luxon';

import type { DateTimeWithPreset } from '@linode/api-v4';

export const defaultTimeDuration = (): DateTimeWithPreset => {
  const date = DateTime.now().set({ second: 0 }).setZone('GMT');

  const start = convertToGmt(date.minus({ minutes: 30 }).toISO() ?? '', 'GMT');
  const end = convertToGmt(date.toISO() ?? '', 'GMT');

  return {
    end,
    preset: '30minutes',
    start,
    timeZone: 'GMT',
  };
};

export const convertToGmt = (date: string, timeZone: string): string => {
  const dateObject = DateTime.fromISO(date).setZone(timeZone);
  const updatedDate = dateObject.setZone('GMT');

  return updatedDate.toISO()?.split('.')[0] + 'Z';
};
