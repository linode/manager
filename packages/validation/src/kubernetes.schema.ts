import { validateIP } from './firewalls.schema';
import { array, number, object, string, boolean } from 'yup';

export const nodePoolSchema = object().shape({
  type: string(),
  count: number(),
});

export const AutoscaleNodePoolSchema = object({
  enabled: boolean(),
  min: number().when('enabled', {
    is: true,
    then: (schema) =>
      schema
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
    then: (schema) =>
      schema
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

export const ipv4Address = string().defined().test({
  name: 'validateIP',
  message: 'Must be a valid IPv4 address.',
  test: validateIP,
});

export const ipv6Address = string().defined().test({
  name: 'validateIP',
  message: 'Must be a valid IPv6 address.',
  test: validateIP,
});

const controlPlaneACLOptionsSchema = object().shape({
  enabled: boolean(),
  'revision-id': string(),
  addresses: object()
    .shape({
      ipv4: array().of(ipv4Address).nullable(),
      ipv6: array().of(ipv6Address).nullable(),
    })
    .notRequired(),
});

export const kubernetesControlPlaneACLPayloadSchema = object().shape({
  acl: controlPlaneACLOptionsSchema,
});

// Starts with a letter or number and contains letters, numbers, hyphens, dots, and underscores
const alphaNumericValidCharactersRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-._]*[a-zA-Z0-9])?$/;

// DNS subdomain prefix (example.com/my-app)
const dnsPrefixRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;

const validateLabel = (labels: { [key: string]: string }): boolean => {
  if (labels) {
    for (const [labelKey, labelValue] of Object.entries(labels)) {
      // Confirm the key and value both exist.
      if (!labelKey || !labelValue) {
        return false;
      }

      // If the key has a slash, validate it as a DNS subdomain; else, validate as a simple key.
      if (labelKey.includes('/')) {
        const [prefix, suffix] = labelKey.split('/');

        if (!dnsPrefixRegex.test(prefix)) {
          return false;
        }

        // Confirm total key length is 128 chars max (DNS limit) and suffix is 62 chars max.
        if (labelKey.length > 128 || suffix.length > 62) {
          return false;
        }
      } else {
        // Simple keys contain valid alphanumeric characters up to a max length of 63.
        if (
          labelKey.length > 63 ||
          !alphaNumericValidCharactersRegex.test(labelKey)
        ) {
          return false;
        }
      }

      // Label values contain valid alphanumeric characters up to a max length of 63.
      if (
        labelValue.length > 63 ||
        !alphaNumericValidCharactersRegex.test(labelValue)
      ) {
        return false;
      }
    }

    // All key-value pairs are valid.
    return true;
  }
  return false; // No label provided.
};
export const labelSchema = object().test({
  name: 'validateLabels',
  message: 'Labels must be valid key-value pairs.',
  test: validateLabel,
});

export const taintSchema = object().shape({
  key: string()
    .matches(
      alphaNumericValidCharactersRegex || dnsPrefixRegex,
      'Key must start with a letter or number and may contain letters, numbers, hyphens, dots, and underscores, up to 253 characters.'
    )
    .max(253, 'Key must be between 1 and 253 characters.')
    .min(1, 'Key must be between 1 and 253 characters.')
    .required('Key is required.'),
  value: string()
    .matches(
      alphaNumericValidCharactersRegex,
      'Value must start with a letter or number and may contain letters, numbers, hyphens, dots, and underscores, up to 63 characters.'
    )
    .max(63, 'Value must be between 0 and 63 characters.')
    .notOneOf(
      ['kubernetes.io', 'linode.com'],
      'Value cannot be "kubernetes.io" or "linode.com".'
    )
    .notRequired(),
});
