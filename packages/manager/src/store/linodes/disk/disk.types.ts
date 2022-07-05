import { Disk } from '@linode/api-v4';

export interface Entity extends Disk {
  linode_id: number;
}
