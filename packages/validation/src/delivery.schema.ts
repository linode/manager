import { array, boolean, lazy, mixed, number, object, string } from 'yup';

import type { InferType, MixedSchema, Schema } from 'yup';

const maxLength = 255;
const maxLengthMessage = 'Length must be 255 characters or less.';

// Logs Delivery Destination

const authenticationDetailsSchema = object({
  basic_authentication_user: string()
    .max(maxLength, maxLengthMessage)
    .required(),
  basic_authentication_password: string()
    .max(maxLength, maxLengthMessage)
    .required(),
});

const authenticationSchema = object({
  type: string().oneOf(['basic', 'none']).required(),
  details: mixed()
    .defined()
    .when('type', {
      is: 'basic',
      then: () => authenticationDetailsSchema.required(),
      otherwise: () =>
        mixed()
          .nullable()
          .test(
            'null-or-undefined',
            'For type `none` details should be `null` or `undefined`.',
            (value) => !value,
          ),
    }) as Schema<InferType<typeof authenticationDetailsSchema> | undefined>,
});

const clientCertificateDetailsSchema = object({
  tls_hostname: string().max(maxLength, maxLengthMessage).required(),
  client_ca_certificate: string().required(),
  client_certificate: string().required(),
  client_private_key: string().required(),
});

const customHeaderSchema = object({
  name: string().max(maxLength, maxLengthMessage).required(),
  value: string().max(maxLength, maxLengthMessage).required(),
});

const customHTTPsDetailsSchema = object({
  authentication: authenticationSchema.required(),
  client_certificate_details: clientCertificateDetailsSchema.optional(),
  content_type: string()
    .oneOf(['application/json', 'application/json; charset=utf-8'])
    .required(),
  custom_headers: array().of(customHeaderSchema).min(1).optional(),
  data_compression: string().oneOf(['gzip', 'None']).required(),
  endpoint_url: string().max(maxLength, maxLengthMessage).required(),
});

const akamaiObjectStorageDetailsBaseSchema = object({
  host: string().max(maxLength, maxLengthMessage).required('Host is required.'),
  bucket_name: string()
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
    .max(63, 'Bucket name must be between 3 and 63 characters.'),
  path: string().max(maxLength, maxLengthMessage).defined(),
  access_key_id: string()
    .max(maxLength, maxLengthMessage)
    .required('Access Key ID is required.'),
  access_key_secret: string()
    .max(maxLength, maxLengthMessage)
    .required('Secret Access Key is required.'),
});

const akamaiObjectStorageDetailsPayloadSchema =
  akamaiObjectStorageDetailsBaseSchema.shape({
    path: string().max(maxLength, maxLengthMessage).optional(),
  });

const destinationSchemaBase = object().shape({
  label: string()
    .max(maxLength, maxLengthMessage)
    .required('Destination name is required.'),
  type: string().oneOf(['akamai_object_storage', 'custom_https']).required(),
  details: mixed<
    | InferType<typeof akamaiObjectStorageDetailsBaseSchema>
    | InferType<typeof customHTTPsDetailsSchema>
  >()
    .defined()
    .required()
    .when('type', {
      is: 'akamai_object_storage',
      then: () => akamaiObjectStorageDetailsBaseSchema,
      otherwise: () => customHTTPsDetailsSchema,
    }),
});

export const destinationFormSchema = destinationSchemaBase;

export const createDestinationSchema = destinationSchemaBase.shape({
  details: mixed<
    | InferType<typeof akamaiObjectStorageDetailsPayloadSchema>
    | InferType<typeof customHTTPsDetailsSchema>
  >()
    .defined()
    .required()
    .when('type', {
      is: 'akamai_object_storage',
      then: () => akamaiObjectStorageDetailsPayloadSchema,
      otherwise: () => customHTTPsDetailsSchema,
    }),
});

export const updateDestinationSchema = createDestinationSchema
  .omit(['type'])
  .shape({
    details: lazy((value) => {
      if ('bucket_name' in value) {
        return akamaiObjectStorageDetailsPayloadSchema.noUnknown(
          'Object contains unknown fields for Akamai Object Storage Details.',
        );
      }
      if ('client_certificate_details' in value) {
        return customHTTPsDetailsSchema.noUnknown(
          'Object contains unknown fields for Custom HTTPS Details.',
        );
      }

      // fallback schema: force error
      return mixed().test({
        name: 'details-schema',
        message: 'Details object does not match any known schema.',
        test: () => false,
      });
    }),
  });

// Logs Delivery Stream
const clusterRequiredMessage = 'At least one cluster must be selected.';

const streamDetailsBase = object({
  cluster_ids: array()
    .of(number().defined(clusterRequiredMessage))
    .when('is_auto_add_all_clusters_enabled', {
      is: false,
      then: (schema) =>
        schema.min(1, clusterRequiredMessage).required(clusterRequiredMessage),
    }),
  is_auto_add_all_clusters_enabled: boolean(),
});

const streamDetailsSchema = streamDetailsBase.test(
  'cluster_ids-or-all_clusters_enabled',
  'Either cluster_ids or is_auto_add_all_clusters_enabled should be set.',
  (value) => {
    const HasClusterIds = 'cluster_ids' in value;
    const HasAllClustersEnabled = 'is_auto_add_all_clusters_enabled' in value;
    return HasClusterIds !== HasAllClustersEnabled;
  },
);

const detailsShouldNotExistOrBeNull = (schema: MixedSchema) =>
  schema
    .nullable()
    .test(
      'details-should-not-exist',
      'Details should be null or no details passed for type `audit_logs`',
      (value, ctx) => !('details' in ctx) || value === null,
    );

const streamSchemaBase = object({
  label: string()
    .min(3, 'Stream name must have at least 3 characters')
    .max(maxLength, maxLengthMessage)
    .required('Stream name is required.'),
  status: mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']),
  type: string()
    .oneOf(['audit_logs', 'lke_audit_logs'])
    .required('Stream type is required.'),
  destinations: array().of(number().defined()).ensure().min(1).required(),
  details: mixed().when('type', {
    is: 'lke_audit_logs',
    then: () => streamDetailsSchema.required(),
    otherwise: detailsShouldNotExistOrBeNull,
  }),
});

export const createStreamSchema = streamSchemaBase;

export const updateStreamSchema = streamSchemaBase
  .omit(['type'])
  .shape({
    status: mixed<'active' | 'inactive'>()
      .oneOf(['active', 'inactive'])
      .required(),
    details: lazy((value) => {
      if (
        value &&
        typeof value === 'object' &&
        ('cluster_ids' in value || 'is_auto_add_all_clusters_enabled' in value)
      ) {
        return streamDetailsSchema.required();
      }

      // fallback schema: detailsShouldNotExistOrBeNull
      return detailsShouldNotExistOrBeNull(mixed());
    }),
  })
  .noUnknown('Object contains unknown fields');

export const streamAndDestinationFormSchema = object({
  stream: streamSchemaBase.shape({
    destinations: array().of(number().required()).required(),
    details: mixed().when('type', {
      is: 'lke_audit_logs',
      then: () => streamDetailsBase.required(),
      otherwise: (schema) =>
        schema
          .nullable()
          .equals([null], 'Details must be null for audit_logs type'),
    }) as Schema<InferType<typeof streamDetailsSchema> | null>,
  }),
  destination: destinationFormSchema.defined().when('stream.destinations', {
    is: (value: never[]) => !value?.length,
    then: (schema) => schema,
    otherwise: (schema) =>
      schema.shape({
        details: mixed().strip(),
      }),
  }),
});
