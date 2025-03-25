import { pluralize } from './pluralize';

/**
 *
 * @param minutes minutes to convert
 * @param conversion what unit you want the minutes converted to
 * @param includeRemainer whether or not you want the remainder of minutes after conversion
 * For example, if you want the hours and minutes after converting minutes to hours
 *
 * @returns comma-seperated strings of your converted unit of time. If you did not
 * include the remainder, it will just be one number as a string.
 *
 * @example
 *
 * console.log(convertMinutesTo(140, 'hours', true)) // "2,20"
 * console.log(convertMinutesTo(140, 'hours', false)) // "2"
 */
export const convertMinutesTo = (
  minutes: number,
  conversion: 'days' | 'hours',
  includeRemainder: boolean = false
): string => {
  if (conversion === 'hours') {
    return includeRemainder
      ? `${Math.floor(minutes / 60)},${minutes % 60}`
      : `${Math.floor(minutes / 60)}`;
  }

  /** otherwise convert to days */
  return includeRemainder
    ? `${Math.floor(minutes / 1440)},${minutes % 1440}`
    : `${Math.floor(minutes / 1440)}`;
};

/**
 *
 * @param migrationTimeInMins time in minutes you'd like to convert into
 * a human-readable string
 *
 * This should be used in conjunction with the function above it.
 */
export const generateMigrationTimeString = (migrationTimeInMins: number) => {
  /** if the migration is 1 day or more */
  if (migrationTimeInMins >= 1440) {
    const daysAndMinutes = convertMinutesTo(
      migrationTimeInMins,
      'days',
      true
    ).split(',');

    if (+daysAndMinutes[1] >= 60) {
      const [hours, minutes] = convertMinutesTo(
        +daysAndMinutes[1],
        'hours',
        true
      ).split(',');

      return `${pluralize('day', 'days', +daysAndMinutes[0])}, ${pluralize(
        'hour',
        'hours',
        +hours
      )}, and ${pluralize('minute', 'minutes', +minutes)}`;
    }

    return `${pluralize('day', 'days', +daysAndMinutes[0])} and ${pluralize(
      'minute',
      'minutes',
      +daysAndMinutes[1]
    )}`;
  }

  /** if migration time is 1 hour or more */
  if (migrationTimeInMins >= 60) {
    const hoursAndMinutes = convertMinutesTo(
      migrationTimeInMins,
      'hours',
      true
    ).split(',');

    return `${pluralize('hour', 'hours', +hoursAndMinutes[0])} and ${pluralize(
      'minute',
      'minutes',
      +hoursAndMinutes[1]
    )}`;
  }

  return pluralize('minute', 'minutes', migrationTimeInMins);
};

export const formatEventSeconds = (seconds: null | number) => {
  if (!seconds) {
    return ''; // Show nothing if we don't know a duration
  }

  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor((seconds % 3600) / 60);

    return minutes === 0
      ? `${pluralize('hour', 'hours', hours)}`
      : `${pluralize('hour', 'hours', hours)}, ${pluralize(
          'minute',
          'minutes',
          minutes
        )}`;
  }

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return secs === 0
      ? `${pluralize('minute', 'minutes', minutes)}`
      : `${pluralize('minute', 'minutes', minutes)}, ${pluralize(
          'second',
          'seconds',
          secs
        )}`;
  }

  return `${pluralize('second', 'seconds', seconds)}`;
};
