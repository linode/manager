import { array, boolean, mixed, number, object, string } from 'yup';

import type { InferType, MixedSchema, Schema } from 'yup';

const maxLength = 255;
const maxLengthMessage = 'Length must be 255 characters or less.';

// DataSteam Destination

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

const linodeObjectStorageDetailsSchema = object({
  host: string().max(maxLength, maxLengthMessage).required('Host is required.'),
  bucket_name: string()
    .max(maxLength, maxLengthMessage)
    .required('Bucket name is required.'),
  region: string()
    .max(maxLength, maxLengthMessage)
    .required('Region is required.'),
  path: string().max(maxLength, maxLengthMessage).required('Path is required.'),
  access_key_id: string()
    .max(maxLength, maxLengthMessage)
    .required('Access Key ID is required.'),
  access_key_secret: string()
    .max(maxLength, maxLengthMessage)
    .required('Access Key Secret is required.'),
});

export const destinationSchema = object().shape({
  label: string()
    .max(maxLength, maxLengthMessage)
    .required('Destination name is required.'),
  type: string().oneOf(['linode_object_storage', 'custom_https']).required(),
  details: mixed<
    | InferType<typeof customHTTPsDetailsSchema>
    | InferType<typeof linodeObjectStorageDetailsSchema>
  >()
    .defined()
    .required()
    .when('type', {
      is: 'linode_object_storage',
      then: () => linodeObjectStorageDetailsSchema,
      otherwise: () => customHTTPsDetailsSchema,
    }),
});

// DataSteam Stream

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

const detailsShouldBeEmpty = (schema: MixedSchema) =>
  schema
    .defined()
    .test(
      'details-should-be-empty',
      'Empty details for type `audit_logs`',
      (value) => Object.keys(value).length === 0,
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
  details: mixed<InferType<typeof streamDetailsSchema> | object>()
    .when('type', {
      is: 'lke_audit_logs',
      then: () => streamDetailsSchema.required(),
      otherwise: detailsShouldBeEmpty,
    })
    .required(),
});

export const createStreamSchema = streamSchemaBase;

export const updateStreamSchema = streamSchemaBase.shape({
  status: mixed<'active' | 'inactive'>()
    .oneOf(['active', 'inactive'])
    .required(),
});

export const streamAndDestinationFormSchema = object({
  stream: streamSchemaBase.shape({
    destinations: array().of(number().required()).required(),
    details: mixed<InferType<typeof streamDetailsSchema> | object>()
      .when('type', {
        is: 'lke_audit_logs',
        then: () => streamDetailsBase.required(),
        otherwise: detailsShouldBeEmpty,
      })
      .required(),
  }),
  destination: destinationSchema.defined().when('stream.destinations', {
    is: (value: never[]) => !value?.length,
    then: (schema) => schema,
    otherwise: (schema) =>
      schema.shape({
        details: mixed().strip(),
      }),
  }),
});
