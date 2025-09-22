/**
 * Utility functions for handling date and time operations for CloudPulse.
 */

import { DateTime } from 'luxon';

import type { DateTimeWithPreset } from '@linode/api-v4';

/**
 * Returns the default time duration, which is the last 30 minutes from the current time.
 *
 * @param timezone Optional timezone to use. If not provided, the local timezone is used.
 * @returns An object containing start time, end time, preset, and timezone.
 */
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

/**
 * Converts a date string to GMT timezone.
 *
 * @param date ISO date string to convert
 * @param timeZone Optional timezone of the input date. If not provided, the local timezone is used.
 * @returns ISO date string in GMT timezone (with 'Z' suffix)
 */
export const convertToGmt = (date: string, timeZone?: string): string => {
  const dateObject = DateTime.fromISO(date).setZone(
    timeZone ?? DateTime.local().zoneName
  );
  const updatedDate = dateObject.setZone('GMT');

  return updatedDate.toISO()?.split('.')[0] + 'Z';
};

/**
 * Calculates the start and end times based on a preset time range.
 *
 * @param currentValue The current date time range with preset
 * @param timeZone The timezone to use for calculations
 * @returns An object with updated start and end dates based on the preset
 */
export function getTimeFromPreset(
  currentValue: DateTimeWithPreset,
  timeZone: string
): DateTimeWithPreset {
  const today = DateTime.now().setZone(timeZone);
  const { start, end, preset } = currentValue;
  let selectedPreset = preset;
  let startDate: string;
  let endDate: string;
  switch (preset) {
    case 'last 7 days':
      startDate = today.minus({ days: 7 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;

    case 'last 12 hours':
      startDate = today.minus({ hours: 12 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case 'last 30 days':
      startDate = today.minus({ days: 30 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case 'last 30 minutes':
      startDate = today.minus({ minutes: 30 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case 'last day':
      startDate = today.minus({ days: 1 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case 'last hour':
      startDate = today.minus({ hours: 1 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case 'last month':
      startDate = today.minus({ months: 1 }).startOf('month').toISO() ?? start;
      endDate = today.minus({ months: 1 }).endOf('month').toISO() ?? end;
      break;
    case 'this month':
      startDate = today.startOf('month').toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    default:
      // Reset to provided values or empty strings if none provided
      startDate = start;
      endDate = end;
      selectedPreset = 'reset';
  }

  return {
    start: startDate,
    end: endDate,
    preset: selectedPreset,
    timeZone,
  };
}
