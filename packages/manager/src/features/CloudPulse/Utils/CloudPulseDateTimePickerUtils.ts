/**
 * Utility functions for handling date and time operations for CloudPulse.
 */

import { DateTimeRangePicker } from '@linode/ui';
import { DateTime } from 'luxon';

import { PRESET_TO_DURATION_MAP } from './constants';

import type { DateTimeWithPreset } from '@linode/api-v4';
import type { DurationLike } from 'luxon';

/**
 * Returns the default time duration, which is the last 1 hour from the current time.
 *
 * @param timezone Optional timezone to use. If not provided, the local timezone is used.
 * @returns An object containing start time, end time, preset, and timezone.
 */
export const defaultTimeDuration = (
  timezone?: string,
  defaultTimeDurationPreset?: string
): DateTimeWithPreset => {
  const date = DateTime.now()
    .set({ second: 0 })
    .setZone(timezone ?? DateTime.local().zoneName);

  let duration: DurationLike = {
    hours: 1, // default to last 1 hour if no preset is provided
  };

  if (defaultTimeDurationPreset) {
    duration = PRESET_TO_DURATION_MAP[defaultTimeDurationPreset] ?? {
      hours: 1,
    };
  }

  if (
    defaultTimeDurationPreset === DateTimeRangePicker.PRESET_LABELS.LAST_MONTH
  ) {
    // return directly
    return {
      preset: DateTimeRangePicker.PRESET_LABELS.LAST_MONTH,
      start: date.minus({ months: 1 }).startOf('month').toISO() ?? '',
      end: date.minus({ months: 1 }).endOf('month').toISO() ?? '',
      timeZone: timezone,
    };
  }

  if (
    defaultTimeDurationPreset === DateTimeRangePicker.PRESET_LABELS.THIS_MONTH
  ) {
    return {
      preset: DateTimeRangePicker.PRESET_LABELS.THIS_MONTH,
      start: date.startOf('month').toISO() ?? '',
      end: date.toISO() ?? '',
      timeZone: timezone,
    };
  }

  return {
    preset:
      defaultTimeDurationPreset &&
      PRESET_TO_DURATION_MAP[defaultTimeDurationPreset]
        ? defaultTimeDurationPreset
        : DateTimeRangePicker.PRESET_LABELS.LAST_HOUR,
    start: date.minus(duration).toISO() ?? '',
    end: date.toISO() ?? '',
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
    case DateTimeRangePicker.PRESET_LABELS.LAST_7_DAYS:
      startDate = today.minus({ days: 7 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;

    case DateTimeRangePicker.PRESET_LABELS.LAST_12_HOURS:
      startDate = today.minus({ hours: 12 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case DateTimeRangePicker.PRESET_LABELS.LAST_30_DAYS:
      startDate = today.minus({ days: 30 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case DateTimeRangePicker.PRESET_LABELS.LAST_30_MINUTES:
      startDate = today.minus({ minutes: 30 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case DateTimeRangePicker.PRESET_LABELS.LAST_DAY:
      startDate = today.minus({ days: 1 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case DateTimeRangePicker.PRESET_LABELS.LAST_HOUR:
      startDate = today.minus({ hours: 1 }).toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    case DateTimeRangePicker.PRESET_LABELS.LAST_MONTH:
      startDate = today.minus({ months: 1 }).startOf('month').toISO() ?? start;
      endDate = today.minus({ months: 1 }).endOf('month').toISO() ?? end;
      break;
    case DateTimeRangePicker.PRESET_LABELS.THIS_MONTH:
      startDate = today.startOf('month').toISO() ?? start;
      endDate = today.toISO() ?? end;
      break;
    default:
      // Reset to provided values or empty strings if none provided
      startDate = start;
      endDate = end;
      selectedPreset = DateTimeRangePicker.PRESET_LABELS.RESET;
  }

  return {
    start: startDate,
    end: endDate,
    preset: selectedPreset,
    timeZone,
  };
}
