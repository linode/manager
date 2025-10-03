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

const linodeObjectStorageDetailsBaseSchema = object({
  host: string().max(maxLength, maxLengthMessage).required('Host is required.'),
  bucket_name: string()
    .max(maxLength, maxLengthMessage)
    .required('Bucket name is required.'),
  region: string()
    .max(maxLength, maxLengthMessage)
    .required('Region is required.'),
  path: string().max(maxLength, maxLengthMessage).defined(),
  access_key_id: string()
    .max(maxLength, maxLengthMessage)
    .required('Access Key ID is required.'),
  access_key_secret: string()
    .max(maxLength, maxLengthMessage)
    .required('Access Key Secret is required.'),
});

const linodeObjectStorageDetailsPayloadSchema =
  linodeObjectStorageDetailsBaseSchema.shape({
    path: string().max(maxLength, maxLengthMessage).optional(),
  });

const destinationSchemaBase = object().shape({
  label: string()
    .max(maxLength, maxLengthMessage)
    .required('Destination name is required.'),
  type: string().oneOf(['linode_object_storage', 'custom_https']).required(),
  details: mixed<
    | InferType<typeof customHTTPsDetailsSchema>
    | InferType<typeof linodeObjectStorageDetailsBaseSchema>
  >()
    .defined()
    .required()
    .when('type', {
      is: 'linode_object_storage',
      then: () => linodeObjectStorageDetailsBaseSchema,
      otherwise: () => customHTTPsDetailsSchema,
    }),
});

export const destinationFormSchema = destinationSchemaBase;

export const createDestinationSchema = destinationSchemaBase.shape({
  details: mixed<
    | InferType<typeof customHTTPsDetailsSchema>
    | InferType<typeof linodeObjectStorageDetailsPayloadSchema>
  >()
    .defined()
    .required()
    .when('type', {
      is: 'linode_object_storage',
      then: () => linodeObjectStorageDetailsPayloadSchema,
      otherwise: () => customHTTPsDetailsSchema,
    }),
});

export const updateDestinationSchema = createDestinationSchema
  .omit(['type'])
  .shape({
    details: lazy((value) => {
      if ('bucket_name' in value) {
        return linodeObjectStorageDetailsPayloadSchema.noUnknown(
          'Object contains unknown fields for Linode Object Storage Details.',
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

const streamDetailsBase = object({
  cluster_ids: array()
    .of(number().defined())
    .min(1, 'At least one cluster must be selected.'),
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
