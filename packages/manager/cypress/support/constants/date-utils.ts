import { DateTime } from 'luxon';

import type { DateTimeWithPreset } from '@linode/api-v4';

const formatter = "yyyy-MM-dd'T'HH:mm:ss'Z'";
/**
 * This function calculates the start of the current month and the current date and time,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the current month in ISO 8601 format.
 */

export const getThisMonthRange = (): { end: string; start: string } => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const endDate = new Date(now.getTime() - 390 * 60000);

  // Convert to UTC by subtracting 5 hours and 30 minutes (330 minutes)
  startDate.setUTCMinutes(startDate.getUTCMinutes() - 330);
  endDate.setUTCMinutes(endDate.getUTCMinutes() - 330);

  const formattedStartDate = formatDate(startDate, formatter);
  const formattedEndDate = formatDate(endDate, formatter);

  return { end: formattedEndDate, start: formattedStartDate };
};

/**
 * This function calculates the start and end of the previous month,
 * adjusted by subtracting 5 hours and 30 minutes (IST offset),
 * and returns them in the ISO 8601 format (UTC).
 *
 * - The start date corresponds to the first day of the previous month at 00:00:00 UTC.
 * - The end date corresponds to the last day of the previous month at 23:59:59 UTC.
 * - Both dates are adjusted to reflect IST (-5 hours 30 minutes).
 *
 * @returns {{start: string, end: string}} - An object containing:
 *   - `start`: The start date of the previous month in ISO 8601 format.
 *   - `end`: The end date of the previous month in ISO 8601 format.
 */
export const getLastMonthRange = (
): { end: string; start: string } => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const lastMonth = now.getUTCMonth() - 1; // Subtract 1 month

  // Handle year change if the month goes below 0
  const adjustedYear = lastMonth < 0 ? year - 1 : year;
  const adjustedMonth = lastMonth < 0 ? 11 : lastMonth; // December if lastMonth is negative

  // Start of the last month in UTC
  const startDate = new Date(Date.UTC(adjustedYear, adjustedMonth, 1, 0, 0, 0));
  // End of the last month in UTC (last day of the month)
  const endDate = new Date(
    Date.UTC(adjustedYear, adjustedMonth + 1, 0, 23, 59, 59)
  );

  // Adjust both start and end dates by -5 hours and 30 minutes
  startDate.setUTCMinutes(startDate.getUTCMinutes() - 330);
  endDate.setUTCMinutes(endDate.getUTCMinutes() - 330);

  // Format the dates
  const formattedStartDate = formatDate(startDate, formatter);
  const formattedEndDate = formatDate(endDate, formatter);

  return { end: formattedEndDate, start: formattedStartDate };
};

const formatDate = (date: Date, formatter: string): string => {
  const pad = (num: number) => String(num).padStart(2, '0');

  return formatter
    .replace('yyyy', date.getUTCFullYear().toString())
    .replace('MM', pad(date.getUTCMonth() + 1))
    .replace('dd', pad(date.getUTCDate()))
    .replace('HH', pad(date.getUTCHours()))
    .replace('mm', pad(date.getUTCMinutes()))
    .replace('ss', pad(date.getUTCSeconds()))
    .replace("'T'", 'T')
    .replace("'Z'", 'Z');
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
  const now = DateTime.now().setZone('Asia/Kolkata');
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
