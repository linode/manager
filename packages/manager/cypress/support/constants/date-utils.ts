import { DateTime } from 'luxon';

const formatter = "yyyy-MM-dd'T'HH:mm:ss'Z'";
/**
 * This function calculates the start of the current month and the current date and time,
 * adjusted by subtracting 5 hours and 30 minutes, and returns them in the ISO 8601 format (UTC).
 *
 * @returns {{start: string, end: string}} - The start and end dates of the current month in ISO 8601 format.
 */

export const getThisMonthRange = (): { end: string; start: string } => {
  const now = DateTime.utc();
  // Get start and end of the current month in UTC
  const expectedStartDate = now.startOf('month').toUTC();
  const expectedEndDate = now.endOf('month').toUTC();
  // Format the output
  const formattedStartDate = expectedStartDate.toFormat(formatter);
  const formattedEndDate = expectedEndDate.toFormat(formatter);
  return {
    end: formattedEndDate,
    start: formattedStartDate,
  };
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

export const getLastMonthRange = (): { end: string; start: string } => {
  // Get the current UTC time
  const now = DateTime.utc();
  const lastMonth = now.minus({ months: 1 });

  // Get start and end of last month in UTC
  const expectedStartDate = lastMonth.startOf('month').toUTC();
  const expectedEndDate = lastMonth.endOf('month').toUTC();

  // Adjust by -5 hours 30 minutes (IST Offset)
  const adjustedStartDate = expectedStartDate.minus({ hours: 5, minutes: 30 });
  const adjustedEndDate = expectedEndDate.minus({ hours: 5, minutes: 30 });

  // Format the output
  const formattedStartDate = adjustedStartDate.toFormat(formatter);
  const formattedEndDate = adjustedEndDate.toFormat(formatter);
  return {
    end: formattedEndDate,
    start: formattedStartDate,
  };
};

/**
 * Generates a date in Coordinated Universal Time (UTC) based on a specified number of days offset,
 * hour, and minute. The function also provides individual date components such as day, hour,
 * minute, and month.
 *
 * @param {number} daysOffset - The number of days to adjust from the start of the month.
 *                               Positive values give a future date, negative values give a past date.
 * @param {number} hour - The hour to set for the resulting date (0-23).
 * @param {number} [minute=0] - The minute to set for the resulting date (0-59). Defaults to 0.
 *
 * @returns {Object} - Returns an object containing:
 *   - `actualDate`: Formatted date-time string in UTC ("yyyy-MM-dd HH:mm").
 *   - `day`: Day of the month.
 *   - `hour`: Hour of the day in UTC.
 *   - `minute`: Minute of the hour.
 *   - `month`: Month number.
 */
export const getDateRangeInUTC = (
  daysOffset: number,
  hour: number,
  minute: number = 0
) => {
  const now = DateTime.utc();
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
