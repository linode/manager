import { boolean, object, string } from 'yup';

const ENDPOINT_TYPES = ['E0', 'E1', 'E2', 'E3'] as const;

export const CreateBucketSchema = object()
  .shape(
    {
      label: string()
        .required('Bucket name is required.')
        .min(3, 'Bucket name must be between 3 and 63 characters.')
        .matches(/^\S*$/, 'Bucket name must not contain spaces.')
        .matches(
          /^[a-z0-9].*[a-z0-9]$/,
          'Bucket name must start and end with a lowercase letter or number.',
        )
        .matches(
          /^(?!.*[.-]{2})[a-z0-9.-]+$/,
          'Bucket name must contain only lowercase letters, numbers, periods (.), and hyphens (-). Adjacent periods and hyphens are not allowed.',
        )
        .max(63, 'Bucket name must be between 3 and 63 characters.')
        .test(
          'unique-label',
          'A bucket with this name already exists in your selected region',
          (value, context) => {
            const { cluster, region } = context.parent;
            const buckets = context.options.context?.buckets;

            if (!Array.isArray(buckets)) {
              // If buckets is not an array, assume the label is unique
              return true;
            }

            return !buckets.some(
              (bucket) =>
                bucket.label === value &&
                (bucket.cluster === cluster || bucket.region === region),
            );
          },
        ),
      cluster: string().when('region', {
        is: (region: string) => !region || region.length === 0,
        then: (schema) => schema.required('Cluster is required.'),
      }),
      region: string().when('cluster', {
        is: (cluster: string) => !cluster || cluster.length === 0,
        then: (schema) => schema.required('Region is required.'),
      }),
      endpoint_type: string()
        .oneOf([...ENDPOINT_TYPES])
        .optional(),
      cors_enabled: boolean().optional(),
      acl: string()
        .oneOf([
          'private',
          'public-read',
          'authenticated-read',
          'public-read-write',
        ])
        .optional(),
      s3_endpoint: string().optional(),
    },
    [['cluster', 'region']],
  )
  .test('cors-enabled-check', 'Invalid CORS configuration.', function (value) {
    const { endpoint_type, cors_enabled } = value;
    if ((endpoint_type === 'E0' || endpoint_type === 'E1') && !cors_enabled) {
      return this.createError({
        path: 'cors_enabled',
        message: 'CORS must be enabled for endpoint type E0 or E1.',
      });
    }
    if ((endpoint_type === 'E2' || endpoint_type === 'E3') && cors_enabled) {
      return this.createError({
        path: 'cors_enabled',
        message: 'CORS must be disabled for endpoint type E2 or E3.',
      });
    }
    return true;
  });

export const UploadCertificateSchema = object({
  certificate: string().required('Certificate is required.'),
  private_key: string().required('Private key is required.'),
});

export const UpdateBucketAccessSchema = object({
  acl: string()
    .oneOf([
      'private',
      'public-read',
      'authenticated-read',
      'public-read-write',
    ])
    .notRequired(),
  cors_enabled: boolean().notRequired(),
});
