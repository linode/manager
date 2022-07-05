import { Config } from '@linode/api-v4';

export interface Entity extends Config {
  linode_id: number;
}
