import { Config } from '@linode/api-v4/lib/linodes';

export interface Entity extends Config {
  linode_id: number;
}
