import type { DateTime } from 'luxon';

// Preset labels used across DatePicker components
export const PRESET_LABELS = {
  LAST_DAY: 'Last day',
  LAST_HOUR: 'Last hour',
  LAST_7_DAYS: 'Last 7 days',
  LAST_12_HOURS: 'Last 12 hours',
  LAST_30_DAYS: 'Last 30 days',
  LAST_30_MINUTES: 'Last 30 minutes',
  THIS_MONTH: 'This month',
  LAST_MONTH: 'Last month',
  RESET: 'Reset',
} as const;

export const adjustDateSegment = (
  date: DateTime,
  segment: number,
  step: number,
) => {
  switch (segment) {
    case 0:
      return date.plus({ years: step }); // Year
    case 1:
      return date.plus({ months: step }); // Month
    case 2:
      return date.plus({ days: step }); // Day
    default:
      return date;
  }
};

export const getSegmentRanges = (text: string) => [
  [0, 4], // Year
  [5, 7], // Month
  [8, 10], // Day
];
