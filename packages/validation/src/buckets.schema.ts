import { boolean, object, string } from 'yup';

const ENDPOINT_TYPES = ['E0', 'E1', 'E2', 'E3'] as const;

export const CreateBucketSchema = object()
  .shape(
    {
      label: string()
        .required('Label is required.')
        .matches(/^\S*$/, 'Label must not contain spaces.')
        .min(3, 'Label must be between 3 and 63 characters.')
        .max(63, 'Label must be between 3 and 63 characters.'),
      cluster: string().when('region', {
        is: (region: string) => !region || region.length === 0,
        then: string().required('Cluster is required.'),
      }),
      region: string().when('cluster', {
        is: (cluster: string) => !cluster || cluster.length === 0,
        then: string().required('Region is required.'),
      }),
      endpoint_type: string()
        .oneOf([...ENDPOINT_TYPES])
        .notRequired(),
      cors_enabled: boolean().notRequired(),
    },
    [['cluster', 'region']]
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
