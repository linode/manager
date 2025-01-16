import { DateTime } from 'luxon';

import type { TimeDurationDate } from '@linode/api-v4';

export const defaultTimeDuration = (): TimeDurationDate => {
  const date = DateTime.now().setZone('GMT');

  const start = convertToGmt(date.minus({ minutes: 30 }).toISO() ?? '');
  const end = convertToGmt(date.toISO() ?? '');

  return {
    end,
    preset: '30minutes',
    start,
  };
};

export const convertToGmt = (date: string): string => {
  const dateObject = DateTime.fromISO(date);
  const updatedDate = dateObject.setZone('GMT');
  return updatedDate.toISO()?.split('.')[0] + 'Z';
};
