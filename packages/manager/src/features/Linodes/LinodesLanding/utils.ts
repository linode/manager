import { reportException } from 'src/exceptionReporting';

import type { Config, LinodeStatus } from '@linode/api-v4/lib/linodes';

export const parseMaintenanceStartTime = (startTime?: null | string) => {
  if (!startTime) {
    return 'No Maintenance Needed';
  }
  /**
   * this should never happen as long as the API is returning
   * a date format we can parse, but this is a good failsafe.
   */
  if (startTime.match(/valid/i)) {
    reportException('Error parsing maintenance start time', {
      convertedDate: startTime,
      rawDate: startTime,
    });
    return 'Maintenance Window Unknown';
  }

  return startTime;
};

export type ExtendedStatus = 'busy' | 'maintenance' | LinodeStatus;

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

export const getLinodeIconStatus = (status: LinodeStatus) => {
  if (status === 'running') {
    return 'active';
  }
  if (['offline', 'stopped'].includes(status)) {
    return 'inactive';
  }
  return 'other';
};

// Return all (unique) vpc IDs that a linode is assigned to
export const getVPCsFromLinodeConfigs = (configs: Config[]): number[] => {
  const vpcIds = new Set<number>();
  for (const config of configs) {
    if (config.interfaces) {
      for (const linodeInterface of config.interfaces) {
        if (linodeInterface.purpose === 'vpc' && linodeInterface.vpc_id) {
          vpcIds.add(linodeInterface.vpc_id);
        }
      }
    }
  }

  return Array.from(vpcIds);
};
