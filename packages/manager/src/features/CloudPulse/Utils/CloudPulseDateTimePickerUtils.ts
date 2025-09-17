import { DateTime } from 'luxon';

import type { DateTimeWithPreset } from '@linode/api-v4';

export const defaultTimeDuration = (timezone?: string): DateTimeWithPreset => {
  const date = DateTime.now()
    .set({ second: 0 })
    .setZone(timezone ?? DateTime.local().zoneName);

  return {
    end: date.toISO() ?? '',
    preset: 'last hour',
    start: date.minus({ hours: 1 }).toISO() ?? '',
    timeZone: timezone,
  };
};

export const convertToGmt = (date: string, timeZone?: string): string => {
  const dateObject = DateTime.fromISO(date).setZone(
    timeZone ?? DateTime.local().zoneName
  );
  const updatedDate = dateObject.setZone('GMT');

  return updatedDate.toISO()?.split('.')[0] + 'Z';
};
