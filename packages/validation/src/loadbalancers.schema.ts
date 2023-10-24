import { number, object, string, array } from 'yup';

export const CreateCertificateSchema = object({
  certificate: string().required('Certificate is required.'),
  key: string().when('type', {
    is: 'downstream',
    then: string().required('Private Key is required.'),
  }),
  label: string().required('Label is required.'),
  type: string().oneOf(['downstream', 'ca']).required('Type is required.'),
});

export const UpdateCertificateSchema = object().shape(
  {
    certificate: string(),
    key: string().when(['type', 'certificate'], {
      is: (type: string, certificate: string) =>
        type === 'downstream' && certificate,
      then: string().required('Private Key is required'),
    }),
    label: string(),
    type: string().oneOf(['downstream', 'ca']),
  },
  [['certificate', 'key']]
);

export const certificateConfigSchema = object({
  certificates: array(
    object({
      id: number()
        .typeError('Certificate ID must be a number.')
        .required('Certificate ID is required.')
        .min(0, 'Certificate ID is required.'),
      hostname: string().required('A Host Header is required.'),
    })
  ),
});

export const EndpointSchema = object({
  ip: string().required('IP is required.'),
  host: string(),
  port: number().required('Port is required.').min(0).max(65_535),
  rate_capacity: number().required('Rate Capacity is required.'),
});

const HealthCheckSchema = object({
  protocol: string().oneOf(['http', 'tcp']),
  interval: number().min(0),
  timeout: number().min(0),
  unhealthy_threshold: number().min(0),
  healthy_threshold: number().min(0),
  path: string(),
  host: string(),
});

export const CreateServiceTargetSchema = object({
  label: string().required('Label is required.'),
  endpoints: array(EndpointSchema).required(),
  ca_certificate: string().nullable(),
  load_balancing_policy: string()
    .required()
    .oneOf(['round_robin', 'least_request', 'ring_hash', 'random', 'maglev']),
  healthcheck: HealthCheckSchema,
});

export const UpdateServiceTargetSchema = object({
  label: string().min(1, 'Label must not be empty.'),
  endpoints: array(EndpointSchema),
  ca_certificate: string().nullable(),
  load_balancing_policy: string().oneOf([
    'round_robin',
    'least_request',
    'ring_hash',
    'random',
    'maglev',
  ]),
  healthcheck: HealthCheckSchema,
});

export const CreateRouteSchema = object({
  label: string().required('Label is required.'),
  protocol: string().oneOf(['http', 'tcp']),
});

const RouteServiceTargetSchema = object({
  id: number()
    .min(0, 'Service Target ID is required.')
    .required('Service Target ID is required.'),
  percentage: number()
    .min(0, 'Percent must be greater than or equal to 0.')
    .max(100, 'Percent must be less than or equal to 100.')
    .typeError('Percent must be a number.')
    .required('Percent is required.'),
});

const TCPMatchConditionSchema = object({
  hostname: string(),
});

const HTTPMatchConditionSchema = TCPMatchConditionSchema.concat(
  object({
    match_field: string()
      .oneOf(['path_prefix', 'query', 'header', 'method', 'host'])
      .required('Match field is required.'),
    match_value: string().required('Match value is required.'),
    session_stickiness_cookie: string().nullable(),
    session_stickiness_ttl: number()
      .min(0, 'TTL must be greater than or equal to 0.')
      .typeError('TTL must be a number.')
      .nullable(),
  })
);

const BaseRuleSchema = object({
  service_targets: array(RouteServiceTargetSchema)
    .test(
      'sum-of-percentage',
      'The sum of the percentages must be 100',
      (serviceTargets) => {
        // An empty array is okay.
        if (!serviceTargets || serviceTargets.length === 0) {
          return true;
        }
        const sum = serviceTargets.reduce((acc, serviceTarget) => {
          return acc + (serviceTarget?.percentage ?? 0);
        }, 0);
        return sum === 100;
      }
    )
    .required(),
});

export const HTTPRuleSchema = BaseRuleSchema.concat(
  object({
    match_condition: HTTPMatchConditionSchema,
  })
);

export const TCPRuleSchema = BaseRuleSchema.concat(
  object({
    match_condition: TCPMatchConditionSchema,
  })
);

export const UpdateRouteSchema = object({
  label: string(),
  protocol: string().oneOf(['tcp', 'http']),
  rules: array().when('protocol', {
    is: 'tcp',
    then: (o) => o.of(TCPRuleSchema),
    otherwise: (o) => o.of(HTTPRuleSchema),
  }),
});

export const TestUpdateRouteSchema = object({
  label: string(),
  protocol: string().oneOf(['tcp', 'http']),
  rules: array().when('protocol', {
    is: 'tcp',
    then: (o) => o.of(TCPRuleSchema),
    otherwise: (o) => o.of(HTTPRuleSchema),
  }),
});
