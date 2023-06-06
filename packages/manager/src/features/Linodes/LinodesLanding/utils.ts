import { LinodeStatus } from '@linode/api-v4/lib/linodes';
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
      convertedDate: startTime,
    });
    return 'Maintenance Window Unknown';
  }

  return startTime;
};

export type ExtendedStatus = LinodeStatus | 'maintenance' | 'busy';

// Given a Linode's status, assign it a priority so the "Status" column can be sorted in this way.
export const statusToPriority = (status: ExtendedStatus): number => {
  switch (status) {
    case 'maintenance':
      return 1;
    case 'stopped':
      return 2;
    case 'busy':
      return 3;
    case 'running':
      return 4;
    case 'offline':
      return 5;
    default:
      // All long-running statuses ("resizing", "cloning", etc.) are given priority 3.
      return 3;
  }
};
