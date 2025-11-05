import { capitalize } from '@linode/utilities';

import type { TransformFunction, TransformFunctionMap } from './types';
import type { CloudPulseServiceType } from '@linode/api-v4';

// Transform functions to transform the dimension value
export const TRANSFORMS: TransformFunctionMap = {
  original: (value: string) => value,
  capitalize: (value: string) => capitalize(value),
  uppercase: (value: string) => value.toUpperCase(),
  lowercase: (value: string) => value.toLowerCase(),
};

/**
 * @description Configuration mapping service types to their dimension-specific transform functions.
 * Defines how dimension values should be formatted/transformed for different CloudPulse services.
 */
export const DIMENSION_TRANSFORM_CONFIG: Partial<
  Record<CloudPulseServiceType, Record<string, TransformFunction>>
> = {
  linode: {
    operation: TRANSFORMS.capitalize,
    type: TRANSFORMS.capitalize,
    pattern: TRANSFORMS.capitalize,
    protocol: TRANSFORMS.capitalize,
  },
  dbaas: {
    node_type: TRANSFORMS.capitalize,
  },
  firewall: {
    interface_type: TRANSFORMS.uppercase,
    linode_id: TRANSFORMS.original,
    nodebalancer_id: TRANSFORMS.original,
    ip_version: TRANSFORMS.original,
  },
  nodebalancer: {
    protocol: TRANSFORMS.uppercase,
  },
  objectstorage: {
    endpoint: TRANSFORMS.original,
  },
  blockstorage: {
    linode_id: TRANSFORMS.original,
  },
};
