import { LinodeStatus, Linode } from '@linode/api-v4/lib/linodes';
import { ExtendedEvent } from 'src/store/events/event.types';

interface LinodeWithMaintenance extends Linode {
  _maintenance?: Maintenance | null;
}

interface LinodeWithDisplayStatus extends Linode {
  _displayStatus?: ExtendedStatus;
  _statusPriority?: number;
}

interface LinodeWithRecentEvent extends Linode {
  _recentEvent?: ExtendedEvent;
}

export type ShallowExtendedLinode = LinodeWithMaintenance &
  LinodeWithDisplayStatus &
  LinodeWithRecentEvent;

/**
 * _when_ is not guaranteed to exist if this is a maintenance notification
 *
 * _when_ could be in the past
 *
 * In the case of maintenance, _until_ is always going to be _null_,
 * so we cannot tell the user when their maintenance window will end. :(
 */
export interface Maintenance {
  type: MaintenanceType;
  when: string | null;
  until: string | null;
}

export type MaintenanceType = 'reboot-scheduled' | 'migration-pending';

export type ExtendedStatus = LinodeStatus | 'maintenance' | 'busy';
