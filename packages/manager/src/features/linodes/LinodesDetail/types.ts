import { Event, GrantLevel, Notification } from '@linode/api-v4/lib/account';
import {
  Config,
  Disk,
  LinodeType,
  LinodeInterface
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';

export interface ExtendedLinode extends LinodeWithMaintenance {
  _configs: Config[];
  _disks: Disk[];
  _interfaces: LinodeInterface[];
  _events: Event[];
  _notifications: Notification[];
  _volumes: Volume[];
  _volumesError?: APIError[];
  _type?: null | LinodeType;
  _permissions: GrantLevel;
  // In the Linodes table, the "Status" column can be sorted by priority.
  // Example: "Needs Maintenance" has a higher priority than "Offline".
  _statusPriority?: number;
}
