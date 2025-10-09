// Transform keys for the dimension filter value transform function
export type TransformKey =
  | 'capitalize'
  | 'lowercase'
  | 'original'
  | 'uppercase';

export type TransformFunction = (value: string) => string;

export type TransformFunctionMap = Record<TransformKey, TransformFunction>;

export interface FirewallEntity {
  /**
   * The id of the parent entity.
   */
  id: string;
  /**
   * The label of the parent entity.
   */
  label: string;
}

// Array of entity types that are supported by the firewall dashboard
export type FirewallEntityType = 'linode' | 'linode_interface' | 'nodebalancer';

// Map of dashboard id to the firewall entity type
export type FirewallEntityTypeMap = Record<number, FirewallEntityType[]>;
