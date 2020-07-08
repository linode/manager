import { reportException } from 'src/exceptionReporting';
import { LinodeStatus } from '@linode/api-v4/lib/linodes';

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

// Given a Linode's status, assign it a priority so the "Status" column can be sorted in this way.
export const statusToPriority = (
  status: LinodeStatus | 'maintenance'
): number => {
  switch (status) {
    case 'maintenance':
      return 1;
    case 'stopped':
      return 2;
    case 'running':
      return 4; // Intentionally skip "3" for now.
    case 'offline':
      return 5;
    default:
      // All long-running statuses ("resizing", "cloning", etc.) are given priority 3.
      return 3;
  }
};
