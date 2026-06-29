import { capitalize } from '@akamai/compute-ui-core/formatting';

import type { TransformFunction, TransformFunctionMap } from './types';
import type { CloudPulseServiceType } from '@linode/api-v4';

// Transform functions to transform the dimension value
export const TRANSFORMS: TransformFunctionMap = {
  original: (value: string) => value,
  capitalize: (value: string) => capitalize(value),
  uppercase: (value: string) => value.toUpperCase(),
  lowercase: (value: string) => value.toLowerCase(),
  responseType: (value: string) => {
    return responseTypeFormatMap.get(value) || value;
  },
};

const responseTypeFormatMap: Map<string, string> = new Map([
  ['quota_exceeded', '403 (Quota Exceeded)'],
  ['rate_limited', '503 (Rate Limited)'],
]);

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
    protocol: TRANSFORMS.uppercase,
    ip_version: TRANSFORMS.original,
    region_id: TRANSFORMS.original,
  },
  nodebalancer: {
    protocol: TRANSFORMS.uppercase,
  },
  objectstorage: {
    endpoint: TRANSFORMS.original,
    response_type: TRANSFORMS.responseType, // Custom transform function for response_type dimension to provide more user-friendly labels, only for object storage service
  },
  blockstorage: {
    linode_id: TRANSFORMS.original,
  },
  netloadbalancer: {
    protocol: TRANSFORMS.uppercase,
  },
};
