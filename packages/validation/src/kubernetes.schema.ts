import ipaddr from 'ipaddr.js';
import { array, number, object, string, boolean } from 'yup';

export const nodePoolSchema = object().shape({
  type: string(),
  count: number(),
});

export const AutoscaleNodePoolSchema = object({
  enabled: boolean(),
  min: number().when('enabled', {
    is: true,
    then: number()
      .required()
      .test(
        'min',
        'Minimum must be between 1 and 99 nodes and cannot be greater than Maximum.',
        function (min) {
          if (!min) {
            return false;
          }
          if (min < 1 || min > 99) {
            return false;
          }
          if (min > this.parent['max']) {
            return false;
          }
          return true;
        }
      ),
  }),
  max: number().when('enabled', {
    is: true,
    then: number()
      .required()
      .min(1, 'Maximum must be between 1 and 100 nodes.')
      .max(100, 'Maximum must be between 1 and 100 nodes.'),
  }),
});

export const clusterLabelSchema = string()
  .required('Label is required.')
  /**
   * This regex is adapted from the API docs. Kubernetes does
   * not allow underscores.
   */
  .matches(
    /^[a-zA-Z0-9-]+$/,
    'Cluster labels cannot contain special characters, spaces, or underscores.'
  )
  .min(3, 'Length must be between 3 and 32 characters.')
  .max(32, 'Length must be between 3 and 32 characters.');

export const createKubeClusterSchema = object().shape({
  label: clusterLabelSchema,
  region: string().required('Region is required.'),
  k8s_version: string().required('Kubernetes version is required.'),
  node_pools: array()
    .of(nodePoolSchema)
    .min(1, 'Please add at least one node pool.'),
});

const ipv4Validation = string().test({
  message: 'Must be a valid IPv4 address.',
  test: (value) => {
    if (value !== '' && value === undefined) {
      return false;
    }

    return (
      value === '' ||
      ipaddr.IPv4.isValid(value) ||
      ipaddr.IPv4.isValidCIDR(value)
    );
  },
});

const ipv6Validation = string().test({
  message: 'Must be a valid IPv6 address.',
  test: (value) => {
    if (value !== '' && value === undefined) {
      return false;
    }

    return (
      value === '' ||
      ipaddr.IPv6.isValid(value) ||
      ipaddr.IPv6.isValidCIDR(value)
    );
  },
});

const controlPlaneACLOptionsSchema = object().shape({
  enabled: boolean(),
  'revision-id': string(),
  addresses: object().shape({
    ipv4: array().of(ipv4Validation),
    ipv6: array().of(ipv6Validation),
  }),
});

export const kubernetesControlPlaneACLPayloadSchema = object().shape({
  acl: controlPlaneACLOptionsSchema,
});
