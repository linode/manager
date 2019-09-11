import { Disk } from 'linode-js-sdk/lib/linodes';

export interface Entity extends Disk {
  linode_id: number;
}
