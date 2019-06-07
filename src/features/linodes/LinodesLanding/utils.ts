import { reportException } from 'src/exceptionReporting';
import { formatDate } from 'src/utilities/formatDate';

export const parseMaintenanceStartTime = (startTime?: string | null) => {
  if (!startTime) {
    return 'No Maintenance Needed';
  }

  const parsedDate = formatDate(startTime);

  /**
   * this should never happen as long as the API is returning
   * a date format we can parse, but this is a good failsafe.
   */
  if (parsedDate.match(/invalid/i)) {
    reportException('Error parsing maintenance start time', {
      rawDate: startTime,
      convertedDate: parsedDate
    });
    return 'Maintenance Window Unknown';
  }

  return parsedDate;
};
