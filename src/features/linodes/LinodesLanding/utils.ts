import { reportException } from 'src/exceptionReporting';

export const parseMaintenanceStartTime = (startTime?: string | null) => {
  if (!startTime) {
    return 'No Maintenance Needed';
  }
  /**
   * this should never happen as long as the API is returning
   * a date format we can parse, but this is a good failsafe.
   */
  if (startTime.match(/valid/i)) {
    reportException('Error parsing maintenance start time', {
      rawDate: startTime,
      convertedDate: startTime
    });
    return 'Maintenance Window Unknown';
  }

  return startTime;
};
