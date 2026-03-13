import {
  array,
  boolean,
  lazy,
  mixed,
  number,
  object,
  string,
  ValidationError,
} from 'yup';

import type { InferType, MixedSchema, Schema } from 'yup';

const maxLength = 255;
const maxLengthMessage = 'Length must be 255 characters or less.';

// Logs Delivery Destination

const authenticationDetailsSchema = object({
  basic_authentication_user: string()
    .max(maxLength, maxLengthMessage)
    .required('Username is required for Basic Authentication.'),
  basic_authentication_password: string()
    .max(maxLength, maxLengthMessage)
    .required('Password is required for Basic Authentication.'),
});

const authenticationSchema = object({
  type: string()
    .oneOf(['basic', 'none'])
    .required('Authentication is required.'),
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
            'For none authentication details should be `null` or `undefined`.',
            (value) => !value,
          ),
    }) as Schema<InferType<typeof authenticationDetailsSchema> | undefined>,
});

const hasValue = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0;

const clientCertificateDetailsSchema = object({
  tls_hostname: string().max(maxLength, maxLengthMessage),
  client_ca_certificate: string(),
  client_certificate: string(),
  client_private_key: string(),
}).test(
  'all-or-nothing-cert-details',
  'If any certificate detail is provided, all are required.',
  function (value) {
    if (!value) {
      return true;
    }

    const { client_ca_certificate, client_certificate, client_private_key } =
      value;

    const fields = [
      client_ca_certificate,
      client_certificate,
      client_private_key,
    ];
    const hasAnyValue = fields.some(hasValue);
    const hasAllValues = fields.every(hasValue);

    if (!hasAnyValue || hasAllValues) {
      return true;
    }

    const errors: ValidationError[] = [];
    if (!hasValue(client_ca_certificate)) {
      errors.push(
        this.createError({
          path: `${this.path}.client_ca_certificate`,
          message:
            'CA Certificate is required when other client certificate details are provided.',
        }),
      );
    }
    if (!hasValue(client_certificate)) {
      errors.push(
        this.createError({
          path: `${this.path}.client_certificate`,
          message:
            'Client Certificate is required when other client certificate details are provided.',
        }),
      );
    }
    if (!hasValue(client_private_key)) {
      errors.push(
        this.createError({
          path: `${this.path}.client_private_key`,
          message:
            'Client Key is required when other client certificate details are provided.',
        }),
      );
    }

    return new ValidationError(errors);
  },
);

const forbiddenCustomHeaderNames = [
  'content-type',
  'encoding',
  'authorization',
  'host',
  'akamai',
];

const customHeaderSchema = object({
  name: string()
    .max(maxLength, maxLengthMessage)
    .required('Custom Header Name is required.')
    .test(
      'non-empty-name',
      'Custom Header Name cannot be empty or whitespace only.',
      (value) => hasValue(value),
    )
    .test(
      'forbidden-custom-header-name',
      'This header name is not allowed.',
      (value) =>
        !forbiddenCustomHeaderNames.includes(value.trim().toLowerCase()),
    ),
  value: string()
    .max(maxLength, maxLengthMessage)
    .required('Custom Header Value is required.')
    .test(
      'non-empty-value',
      'Custom Header Value cannot be empty or whitespace only.',
      (value) => hasValue(value),
    ),
});

const urlRgx = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]+)+(\/\S*)?$/;

const customHTTPSDetailsSchema = object({
  authentication: authenticationSchema.required(),
  client_certificate_details: clientCertificateDetailsSchema.optional(),
  content_type: string()
    .oneOf(['application/json', 'application/json; charset=utf-8'])
    .nullable()
    .optional(),
  custom_headers: array()
    .of(customHeaderSchema)
    .min(1)
    .optional()
    .test(
      'unique-header-names',
      'Custom Header Names must be unique.',
      function (headers) {
        if (!headers || headers.length === 0) {
          return true;
        }

        const seenNames = new Set<string>();
        const errors: ValidationError[] = [];

        headers.forEach((header, index) => {
          const trimmedName = header?.name?.trim().toLowerCase();
          if (!trimmedName) {
            return;
          }

          if (seenNames.has(trimmedName)) {
            errors.push(
              this.createError({
                path: `${this.path}[${index}].name`,
                message: 'Custom Header Name must be unique.',
              }),
            );
          } else {
            seenNames.add(trimmedName);
          }
        });

        return errors.length === 0 || new ValidationError(errors);
      },
    ),
  data_compression: string().oneOf(['gzip', 'None']).required(),
  endpoint_url: string()
    .max(maxLength, maxLengthMessage)
    .required('Endpoint URL is required.')
    .test('is-valid-url', 'Endpoint URL must be a valid URL.', (value) =>
      urlRgx.test(value),
    ),
});

const hostRgx =
  // eslint-disable-next-line sonarjs/slow-regex
  /(?<bucket>[a-z0-9-.]+)\.(?:s3(?:-accesspoint)?\.[a-z0-9-]+\.amazonaws\.com|(?!devcloud\.)[a-z0-9-]+\.(?:devcloud\.)?linodeobjects\.com)/;

const akamaiObjectStorageDetailsBaseSchema = object({
  host: string()
    .max(maxLength, maxLengthMessage)
    .required('Endpoint is required.')
    .test(
      'host-must-match-with-bucket-name-if-provided',
      'Bucket name provided as a part of the endpoint must be the same as the bucket.',
      (value, ctx) => {
        if (ctx.parent.bucket_name) {
          const groups = hostRgx.exec(value)?.groups;
          return groups ? groups.bucket === ctx.parent.bucket_name : true;
        }

        return true;
      },
    ),
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
    .max(63, 'Bucket name must be between 3 and 63 characters.')
    .test(
      'bucket-name-same-in-host-if-provided',
      'Bucket must match the bucket name used in the host prefix.',
      (value, ctx) => {
        if (ctx.parent.host) {
          const groups = hostRgx.exec(ctx.parent.host)?.groups;
          return groups ? groups.bucket === value : true;
        }

        return true;
      },
    ),
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
    | InferType<typeof customHTTPSDetailsSchema>
  >()
    .defined()
    .required()
    .when('type', {
      is: 'akamai_object_storage',
      then: () => akamaiObjectStorageDetailsBaseSchema,
      otherwise: () => customHTTPSDetailsSchema,
    }),
});

export const destinationFormSchema = destinationSchemaBase;

export const createDestinationSchema = destinationSchemaBase.shape({
  details: mixed<
    | InferType<typeof akamaiObjectStorageDetailsPayloadSchema>
    | InferType<typeof customHTTPSDetailsSchema>
  >()
    .defined()
    .required()
    .when('type', {
      is: 'akamai_object_storage',
      then: () => akamaiObjectStorageDetailsPayloadSchema,
      otherwise: () => customHTTPSDetailsSchema,
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
      if ('endpoint_url' in value) {
        return customHTTPSDetailsSchema.noUnknown(
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
    .min(3, 'Stream name must have at least 3 characters.')
    .max(maxLength, maxLengthMessage)
    .required('Stream name is required.'),
  status: mixed<'active' | 'inactive' | 'provisioning'>().oneOf([
    'active',
    'inactive',
    'provisioning',
  ]),
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
    status: mixed<'active' | 'inactive' | 'provisioning'>()
      .oneOf(['active', 'inactive', 'provisioning'])
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
  .noUnknown('Object contains unknown fields.');

export const streamAndDestinationFormSchema = object({
  stream: streamSchemaBase.shape({
    destinations: array().of(number().required()).required(),
    details: mixed().when('type', {
      is: 'lke_audit_logs',
      then: () => streamDetailsBase.required(),
      otherwise: (schema) =>
        schema
          .nullable()
          .equals([null], 'Details must be null for audit_logs type.'),
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
