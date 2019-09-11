import { Config } from 'linode-js-sdk/lib/linodes';

export interface Entity extends Config {
  linode_id: number;
}
