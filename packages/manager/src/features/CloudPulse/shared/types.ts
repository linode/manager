// Transform keys for the dimension filter value transform function
export type TransformKey =
  | 'capitalize'
  | 'lowercase'
  | 'original'
  | 'uppercase';

export type TransformFunction = (value: string) => string;

export type TransformFunctionMap = Record<TransformKey, TransformFunction>;

export type AssociatedEntityType = 'linode' | 'nodebalancer';

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
