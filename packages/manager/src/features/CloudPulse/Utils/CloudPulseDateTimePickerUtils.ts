import { DateTime } from 'luxon';

import type { DateTimeWithPreset } from '@linode/api-v4';

const formatter = "yyyy-MM-dd'T'HH:mm:ss'Z'";
const timezone = 'Asia/Kolkata';

export const defaultTimeDuration = (): DateTimeWithPreset => {
  const date = DateTime.now().set({ second: 0 }).setZone('GMT');

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

/**
 * This function calculates the start of the current month and the current date and time,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the current month in ISO 8601 format.
 */
export const getThisMonthRange = (): DateTimeWithPreset => {
  const now = DateTime.now().setZone(timezone);

  const expectedStartDateISO = now.startOf('month').toISO() ?? '';
  const expectedEndDateISO = now.toISO() ?? '';

  const adjustedStartDate = DateTime.fromISO(expectedStartDateISO, {
    zone: 'gmt',
  });
  const adjustedEndDate = DateTime.fromISO(expectedEndDateISO, { zone: 'gmt' });
  const formattedStartDate = adjustedStartDate.toFormat(formatter);
  const formattedEndDate = adjustedEndDate.toFormat(formatter);

  return {
    end: formattedEndDate,
    start: formattedStartDate,
  };
};

/**
 * This function calculates the start and end of the previous month,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them
 * in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the previous month in ISO 8601 format.
 */
export const getLastMonthRange = (): DateTimeWithPreset => {
  const now = DateTime.now().setZone(timezone);
  const lastMonth = now.minus({ months: 1 });

  const expectedStartDateISO = lastMonth.startOf('month').toISO() ?? '';
  const expectedEndDateISO = lastMonth.endOf('month').toISO() ?? '';

  const adjustedStartDate = DateTime.fromISO(expectedStartDateISO, {
    zone: 'gmt',
  });
  const adjustedEndDate = DateTime.fromISO(expectedEndDateISO, { zone: 'gmt' });

  const formattedStartDate = adjustedStartDate.toFormat(formatter);
  const formattedEndDate = adjustedEndDate.toFormat(formatter);

  return {
    end: formattedEndDate,
    start: formattedStartDate,
  };
};

/**
 * Generates a date in Indian Standard Time (IST) based on a specified number of days offset,
 * hour, and minute. The function also provides individual date components such as day, hour,
 * minute, month, and AM/PM.
 *
 * @param {number} daysOffset - The number of days to adjust from the current date. Positive
 *                               values give a future date, negative values give a past date.
 * @param {number} hour - The hour to set for the resulting date (0-23).
 * @param {number} [minute=0] - The minute to set for the resulting date (0-59). Defaults to 0.
 *
 * @returns {Object} - Returns an object containing:
 *   - `actualDate`: The formatted date and time in IST (YYYY-MM-DD HH:mm).
 *   - `day`: The day of the month as a number.
 *   - `hour`: The hour in the 24-hour format as a number.
 *   - `minute`: The minute of the hour as a number.
 *   - `month`: The month of the year as a number.
 *   - `ampm`: The AM/PM designation of the time (either 'AM' or 'PM').
 */
export const getDateRangeInIST = (
  daysOffset: number,
  hour: number,
  minute: number = 0
) => {
  const now = DateTime.now().setZone(timezone);
  const targetDate = now
    .startOf('month')
    .plus({ days: daysOffset })
    .set({ hour, minute });

  const actualDate = targetDate.toFormat('yyyy-LL-dd HH:mm');
  return {
    actualDate,
    day: targetDate.day,
    hour: targetDate.hour,
    minute: targetDate.minute,
    month: targetDate.month,
  };
};
