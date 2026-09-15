import ipaddr from 'ipaddr.js';
import { array, mixed, number, object, string, ValidationError } from 'yup';

const fieldErrorMessage = 'This field is required.';

const restrictedCustomHeaderNames = [
  'encoding',
  'authorization',
  'host',
  'akamai',
  'content-length',
  'transfer-encoding',
  'connection',
  'content-type',
  'cookie',
  'set-cookie',
  'upgrade',
  'expect',
];

const hasValue = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidUrl = (
  input: string,
  checkProtocol = true,
  prohibitIp = false,
): boolean => {
  if (/\s/.test(input)) {
    return false;
  }

  try {
    const urlToCheck =
      checkProtocol || input.startsWith('http') ? input : `https://${input}`;

    const { protocol, hostname } = new URL(urlToCheck);

    const unwrappedHostname =
      hostname.startsWith('[') && hostname.endsWith(']')
        ? hostname.slice(1, -1)
        : hostname;
    const hasIpAddress = ipaddr.isValid(unwrappedHostname);

    return (
      ['http:', 'https:'].includes(protocol) &&
      !['127.0.0.1', '[::1]', 'localhost'].includes(hostname) &&
      (hostname.includes('.') || hostname.includes(':')) &&
      (!prohibitIp || !hasIpAddress)
    );
  } catch {
    return false;
  }
};

const webhookAuthenticationSchema = object({
  type: string().oneOf(['none', 'basic']).optional(),
  details: mixed()
    .nullable()
    .when('type', ([type], schema) => {
      if (type === 'basic') {
        return object({
          basic_authentication_user: string()
            .required(fieldErrorMessage)
            .test(
              'non-empty-user',
              'Basic authentication username cannot be empty or whitespace only.',
              (value) => hasValue(value),
            ),
          basic_authentication_password: string()
            .required(fieldErrorMessage)
            .test(
              'non-empty-password',
              'Basic authentication password cannot be empty or whitespace only.',
              (value) => hasValue(value),
            ),
        }).required(fieldErrorMessage);
      }
      return schema;
    }),
}).optional();

const webhookClientCertificateDetailsSchema = object({
  tls_hostname: string()
    .optional()
    .test(
      'is-valid-url',
      'TLS hostname must be a valid URL.',
      (value) => !value || isValidUrl(value, false),
    ),
  client_ca_certificate: string().optional(),
  client_certificate: string().optional(),
  client_private_key: string().optional(),
})
  .nullable()
  .optional()
  .test(
    'all-or-nothing-cert-details',
    'If any certificate detail is provided, all are required.',
    function (value) {
      if (!value) {
        return true;
      }

      const {
        client_ca_certificate: caCert,
        client_certificate: clientCert,
        client_private_key: privateKey,
      } = value;
      const requiredFields = [caCert, clientCert, privateKey];
      const hasAnyValue = requiredFields.some(hasValue);
      const hasAllValues = requiredFields.every(hasValue);

      if (!hasAnyValue || hasAllValues) {
        return true;
      }

      const errors: ValidationError[] = [];
      if (!hasValue(caCert)) {
        errors.push(
          this.createError({
            path: `${this.path}.client_ca_certificate`,
            message:
              'CA Certificate is required when other client certificate details are provided.',
          }),
        );
      }
      if (!hasValue(clientCert)) {
        errors.push(
          this.createError({
            path: `${this.path}.client_certificate`,
            message:
              'Client Certificate is required when other client certificate details are provided.',
          }),
        );
      }
      if (!hasValue(privateKey)) {
        errors.push(
          this.createError({
            path: `${this.path}.client_private_key`,
            message:
              'Client Private Key is required when other client certificate details are provided.',
          }),
        );
      }

      return new ValidationError(errors);
    },
  );

const webhookCustomHeaderSchema = object({
  name: string()
    .required(fieldErrorMessage)
    .test(
      'non-empty-name',
      'Custom Header name cannot be empty or whitespace only.',
      (value) => hasValue(value),
    )
    .test(
      'not-restricted-header',
      'This Custom Header name cannot be used.',
      (value) => {
        const normalizedValue = (value ?? '').trim().toLowerCase();
        return !restrictedCustomHeaderNames.includes(normalizedValue);
      },
    ),
  value: string()
    .required(fieldErrorMessage)
    .test(
      'non-empty-name',
      'Custom Header value cannot be empty or whitespace only.',
      (value) => hasValue(value),
    ),
});

export const webhookDetailSchema = object({
  endpoint_url: string()
    .required(fieldErrorMessage)
    .test('is-valid-url', 'Enter a valid URL.', (value) =>
      isValidUrl((value ?? '').trim()),
    )
    .test(
      'no-query-params',
      'Endpoint URL cannot contain query parameters.',
      (value) => !(value ?? '').trim().includes('?'),
    )
    .test('https-always', 'Endpoint URL must always use HTTPS.', (value) =>
      (value ?? '').trim().startsWith('https://'),
    ),
  authentication: webhookAuthenticationSchema,
  data_compression: string().oneOf(['gzip', 'none']).optional(),
  client_certificate_details: webhookClientCertificateDetailsSchema,
  custom_headers: array().of(webhookCustomHeaderSchema).optional(),
});

export const dimensionFilters = object({
  dimension_label: string().required(fieldErrorMessage),
  operator: string()
    .oneOf(['eq', 'neq', 'startswith', 'endswith', 'in'])
    .required(fieldErrorMessage),
  value: string().required(fieldErrorMessage),
});

export const metricCriteria = object({
  metric: string().required(fieldErrorMessage),
  aggregate_function: string()
    .oneOf(['avg', 'count', 'max', 'min', 'sum'])
    .required(fieldErrorMessage),
  operator: string()
    .oneOf(['eq', 'gt', 'lt', 'gte', 'lte'])
    .required(fieldErrorMessage),
  threshold: number()
    .required(fieldErrorMessage)
    .min(0, 'Enter a positive value.')
    .typeError('The value should be a number.'),
  dimension_filters: array().of(dimensionFilters.defined()).optional(),
});

export const triggerConditionValidation = object({
  criteria_condition: string()
    .oneOf(['ALL'])
    .required('Criteria condition is required'),
  polling_interval_seconds: number().required(fieldErrorMessage),
  evaluation_period_seconds: number().required(fieldErrorMessage),
  trigger_occurrences: number()
    .required(fieldErrorMessage)
    .positive('Enter a positive value.')
    .typeError('The value should be a number.'),
});

const specialStartRegex = /^[^a-zA-Z0-9]/;
const specialEndRegex = /[^a-zA-Z0-9]$/;
export const createAlertDefinitionSchema = object({
  label: string()
    .required(fieldErrorMessage)
    .matches(
      /^[^*#&+:<>"?@%{}\\/]+$/,
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.',
    )
    .max(100, 'Name must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Name cannot start or end with a special character.',
      (value) => {
        return !(
          specialStartRegex.test(value ?? '') ||
          specialEndRegex.test(value ?? '')
        );
      },
    ),
  description: string()
    .max(100, 'Description must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Description cannot start or end with a special character.',
      (value) => {
        return !(
          specialStartRegex.test(value ?? '') ||
          specialEndRegex.test(value ?? '')
        );
      },
    )
    .optional(),
  severity: number().oneOf([0, 1, 2, 3]).required(fieldErrorMessage),
  rule_criteria: object({
    rules: array()
      .of(metricCriteria)
      .min(1, 'At least one metric criteria is required.')
      .required(),
  }).required(),
  trigger_conditions: triggerConditionValidation,
  channel_ids: array()
    .of(number().required())
    .required()
    .min(1, 'At least one notification channel is required.'),
  tags: array().of(string().defined()).optional(),
  entity_ids: array().of(string().defined()).optional(),
  regions: array().of(string().defined()).optional(),
  scope: string().oneOf(['entity', 'region', 'account']).nullable().optional(),
  group_by: array()
    .of(string().defined())
    .required()
    .min(1, 'At least one dimension is required.'),
});

export const editAlertDefinitionSchema = object({
  channel_ids: array().of(number().required()).optional(),
  label: string()
    .matches(
      /^[^*#&+:<>"?@%{}\\/]+$/,
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.',
    )
    .max(100, 'Name must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Name cannot start or end with a special character.',
      (value) => {
        return !(
          specialStartRegex.test(value ?? '') ||
          specialEndRegex.test(value ?? '')
        );
      },
    )
    .optional(),
  description: string()
    .max(100, 'Description must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Description cannot start or end with a special character.',
      (value) => {
        return !(
          specialStartRegex.test(value ?? '') ||
          specialEndRegex.test(value ?? '')
        );
      },
    )
    .optional(),
  entity_ids: array().of(string().defined()).optional(),
  rule_criteria: object({
    rules: array()
      .of(metricCriteria)
      .min(1, 'At least one metric criteria is required.')
      .required(),
  })
    .optional()
    .default(undefined),
  tags: array().of(string().defined()).optional(),
  trigger_conditions: triggerConditionValidation.optional().default(undefined),
  severity: number().oneOf([0, 1, 2, 3]).optional(),
  status: string()
    .oneOf([
      'enabled',
      'disabled',
      'failed',
      'provisioning',
      'disabling',
      'enabling',
    ])
    .optional(),
  scope: string().oneOf(['entity', 'region', 'account']).nullable().optional(),
  regions: array().of(string().defined()).optional(),
  group_by: array()
    .of(string().defined())
    .optional()
    .min(1, 'At least one dimension is required.'),
});

export const createNotificationChannelPayloadSchema = object({
  label: string()
    .required(fieldErrorMessage)
    .matches(
      /^[^*#&+:<>"?@%{}\\/]+$/,
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.',
    )
    .max(100, 'Name must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Name cannot start or end with a special character.',
      (value) => {
        return !(
          specialStartRegex.test(value ?? '') ||
          specialEndRegex.test(value ?? '')
        );
      },
    ),
  channel_type: string()
    .oneOf(['email', 'webhook', 'pagerduty', 'slack'])
    .required(fieldErrorMessage),
  details: object().when('channel_type', ([channelType], schema) => {
    if (channelType === 'webhook') {
      return object({
        webhook: webhookDetailSchema.required(),
      }).required();
    }
    return object({
      email: object({
        usernames: array()
          .of(string())
          .min(1, fieldErrorMessage)
          .required(fieldErrorMessage),
      }).required(),
    }).required();
  }),
});

export const editNotificationChannelPayloadSchema = object({
  label: string()
    .required(fieldErrorMessage)
    .matches(
      /^[^*#&+:<>"?@%{}\\/]+$/,
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.',
    )
    .max(100, 'Name must be 100 characters or less.')
    .test(
      'no-special-start-end',
      'Name cannot start or end with a special character.',
      (value) => {
        return !(
          specialStartRegex.test(value ?? '') ||
          specialEndRegex.test(value ?? '')
        );
      },
    ),
  details: object({
    email: object({
      usernames: array()
        .of(string())
        .min(1, fieldErrorMessage)
        .required(fieldErrorMessage),
    }).required(),
  }).required(),
});

export const verifyNotificationChannelPayloadSchema = object({
  webhook: webhookDetailSchema.required(),
});
