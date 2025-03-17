import { validateIP } from './firewalls.schema';
import { array, number, object, string, boolean } from 'yup';

export const nodePoolSchema = object({
  type: string(),
  count: number(),
});

export const AutoscaleNodePoolSchema = object({
  enabled: boolean(),
  min: number().when('enabled', {
    is: true,
    then: (schema) =>
      schema
        .required('Minimum is a required field.')
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
        .required('Maximum is a required field.')
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

const controlPlaneACLOptionsSchema = object({
  enabled: boolean(),
  'revision-id': string(),
  addresses: object({
    ipv4: array().of(ipv4Address).nullable(),
    ipv6: array().of(ipv6Address).nullable(),
  }).notRequired(),
});

const controlPlaneEnterpriseACLOptionsSchema = object({
  enabled: boolean(),
  'revision-id': string(),
  addresses: object({
    ipv4: array().of(ipv4Address),
    ipv6: array().of(ipv6Address),
  }).required(),
});

export const createKubeClusterSchema = object({
  label: clusterLabelSchema,
  region: string().required('Region is required.'),
  k8s_version: string().required('Kubernetes version is required.'),
  node_pools: array()
    .of(nodePoolSchema)
    .min(1, 'Please add at least one node pool.'),
});

export const createKubeEnterpriseClusterSchema = createKubeClusterSchema.concat(
  object({
    control_plane: object({
      high_availability: boolean(),
      acl: object({
        enabled: boolean(),
        'revision-id': string(),
        addresses: object({
          ipv4: array().of(ipv4Address),
          ipv6: array().of(ipv6Address),
        }),
      }),
    })
      .test(
        'validateIPForEnterprise',
        'At least one IP address or CIDR range is required for LKE Enterprise.',
        function (controlPlane) {
          const { ipv4, ipv6 } = controlPlane.acl.addresses;
          // Pass validation if either IP address has a value.
          return (ipv4 && ipv4.length > 0) || (ipv6 && ipv6.length > 0);
        }
      )
      .required(),
  })
);

export const kubernetesControlPlaneACLPayloadSchema = object({
  acl: controlPlaneACLOptionsSchema,
});

export const kubernetesEnterpriseControlPlaneACLPayloadSchema = object({
  acl: controlPlaneEnterpriseACLOptionsSchema.test(
    'validateIPForEnterprise',
    'At least one IP address or CIDR range is required for LKE Enterprise.',
    function (acl) {
      const { ipv4, ipv6 } = acl.addresses || {};
      // Pass validation if either IP address has a value.
      return (
        (ipv4 && ipv4.length > 0 && ipv4[0] !== '') ||
        (ipv6 && ipv6.length > 0 && ipv6[0] !== '')
      );
    }
  ),
});

// Starts and ends with a letter or number and contains letters, numbers, hyphens, dots, and underscores
const alphaNumericValidCharactersRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-._]*[a-zA-Z0-9])?$/;

// DNS subdomain key (example.com/my-app)
const dnsKeyRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-._/]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;

const MAX_DNS_KEY_TOTAL_LENGTH = 128;
const MAX_DNS_KEY_SUFFIX_LENGTH = 62;
const MAX_SIMPLE_KEY_OR_VALUE_LENGTH = 63;

const validateKubernetesLabel = (labels: {
  [key: string]: string;
}): boolean => {
  if (!labels) {
    return false; // No label provided.
  }
  for (const [labelKey, labelValue] of Object.entries(labels)) {
    // Confirm the key and value both exist.
    if (!labelKey || !labelValue) {
      return false;
    }

    if (labelKey.includes('kubernetes.io') || labelKey.includes('linode.com')) {
      return false;
    }

    // If the key has a slash, validate it as a DNS subdomain; else, validate as a simple key.
    if (labelKey.includes('/')) {
      const suffix = labelKey.split('/')[0];

      if (!dnsKeyRegex.test(labelKey)) {
        return false;
      }
      if (
        labelKey.length > MAX_DNS_KEY_TOTAL_LENGTH ||
        suffix.length > MAX_DNS_KEY_SUFFIX_LENGTH
      ) {
        return false;
      }
    } else {
      if (
        labelKey.length > MAX_SIMPLE_KEY_OR_VALUE_LENGTH ||
        !alphaNumericValidCharactersRegex.test(labelKey)
      ) {
        return false;
      }
    }
    // Validate the alphanumeric value.
    if (
      labelValue.length > MAX_SIMPLE_KEY_OR_VALUE_LENGTH ||
      !alphaNumericValidCharactersRegex.test(labelValue)
    ) {
      return false;
    }
  }
  return true; // All key-value pairs are valid.
};

export const kubernetesLabelSchema = object().test({
  name: 'validateLabels',
  message: 'Labels must be valid key-value pairs.',
  test: validateKubernetesLabel,
});

export const kubernetesTaintSchema = object({
  key: string()
    .required('Key is required.')
    .test(
      'valid-key',
      'Key must start with a letter or number and may contain letters, numbers, hyphens, dots, and underscores, up to 253 characters.',
      (value) => {
        return (
          alphaNumericValidCharactersRegex.test(value) ||
          dnsKeyRegex.test(value)
        );
      }
    )
    .max(253, 'Key must be between 1 and 253 characters.')
    .min(1, 'Key must be between 1 and 253 characters.'),
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
