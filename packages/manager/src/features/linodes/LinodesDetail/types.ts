import { Event, GrantLevel } from 'linode-js-sdk/lib/account';
import { Volume } from 'linode-js-sdk/lib/volumes';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';

export interface ExtendedLinode extends LinodeWithMaintenance {
  _configs: Linode.Config[];
  _disks: Linode.Disk[];
  _events: Event[];
  _notifications: Linode.Notification[];
  _volumes: Volume[];
  _volumesError: Linode.ApiFieldError[];
  _type?: null | Linode.LinodeType;
  _permissions: GrantLevel;
}
