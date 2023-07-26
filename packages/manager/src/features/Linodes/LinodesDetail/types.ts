import { Event, GrantLevel } from '@linode/api-v4/lib/account';
import { Config, Disk } from '@linode/api-v4/lib/linodes';

import { ExtendedType } from 'src/utilities/extendType';
import { LinodeWithMaintenance } from 'src/utilities/linodes';

export interface ExtendedLinode extends LinodeWithMaintenance {
  _configs: Config[];
  _disks: Disk[];
  _events: Event[];
  _permissions: GrantLevel;
  // Example: "Needs Maintenance" has a higher priority than "Offline".
  _statusPriority?: number;
  // In the Linodes table, the "Status" column can be sorted by priority.
  _type?: ExtendedType | null;
}
