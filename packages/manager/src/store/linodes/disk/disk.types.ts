import { Disk } from '@linode/api-v4/lib/linodes';

export interface Entity extends Disk {
  linode_id: number;
}
