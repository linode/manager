import type { DimensionFilterOperatorType } from '@linode/api-v4';

export const transformationAllowedOperators: DimensionFilterOperatorType[] = [
  'eq',
  'neq',
  'in',
];

export const LINODE_DIMENSION_LABEL = 'linode_id';
export const VPC_SUBNET_DIMENSION_LABEL = 'vpc_subnet_id';
