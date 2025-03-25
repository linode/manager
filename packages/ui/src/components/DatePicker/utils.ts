import { DateTime } from 'luxon';

export const adjustDateSegment = (
  date: DateTime,
  segment: number,
  step: number
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
