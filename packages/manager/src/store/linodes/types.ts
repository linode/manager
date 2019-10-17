import { Linode } from 'linode-js-sdk/lib/linodes';

/**
 * _when_ is not guaranteed to exist if this is a maintenance notification
 *
 * _when_ could be in the past
 *
 * In the case of maintenance, _until_ is always going to be _null_,
 * so we cannot tell the user when their maintenance window will end. :(
 */

export type Type = 'reboot-scheduled' | 'migration-pending';

export interface Maintenance {
  type: Type;
  when: string | null;
  until: string | null;
}

export interface LinodeWithMaintenance extends Linode {
  maintenance?: Maintenance | null;
}

export interface LinodeWithMaintenanceAndMostRecentBackup
  extends LinodeWithMaintenance {
  mostRecentBackup?: string | null;
  displayStatus?: string;
}
