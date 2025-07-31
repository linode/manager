import { capitalize } from '@linode/utilities';

import type {
  CloudPulseServiceType,
  TransformFunction,
  TransformFunctionMap,
} from '@linode/api-v4';

// Default transform functions
export const TRANSFORMS: TransformFunctionMap = {
  capitalize: (value: string) => capitalize(value),
  uppercase: (value: string) => value.toUpperCase(),
  lowercase: (value: string) => value.toLowerCase(),
};

// Service-specific dimension value transforms
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
    interface_type: TRANSFORMS.capitalize,
  },
  nodebalancer: {
    protocol: TRANSFORMS.uppercase,
  },
};
