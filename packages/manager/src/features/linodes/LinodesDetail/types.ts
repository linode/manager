import { Event, GrantLevel } from 'linode-js-sdk/lib/account';
import { Config, Disk, LinodeType } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { Volume } from 'linode-js-sdk/lib/volumes';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';

export interface ExtendedLinode extends LinodeWithMaintenance {
  _configs: Config[];
  _disks: Disk[];
  _events: Event[];
  _notifications: Notification[];
  _volumes: Volume[];
  _volumesError: APIError[];
  _type?: null | LinodeType;
  _permissions: GrantLevel;
}
