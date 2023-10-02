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

export const certificateConfigSchema = object({
  certificates: array(
    object({
      id: number()
        .typeError('Certificate ID is required.')
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

const RouteServiceTargetSchema = object({
  id: number()
    .min(0, 'Service Target ID is required.')
    .required('Service Target ID is required.'),
  percentage: number()
    .min(0, 'Percent must be greater than or equal to 0.')
    .max(100, 'Percent must be less than or equal to 100.')
    .required(),
});

const MatchConditionSchema = object({
  hostname: string(),
  match_field: string().oneOf([
    'path_prefix',
    'query',
    'header',
    'method',
    'host',
  ]),
  match_value: string(),
  session_stickiness_cookie: string().nullable(),
  session_stickiness_ttl: number().nullable(),
});

export const RuleSchema = object({
  match_condition: MatchConditionSchema,
  service_targets: array(RouteServiceTargetSchema)
    .test(
      'sum-of-percentage',
      'The sum of the percentages must be 100',
      (serviceTargets) => {
        // An empty array is okay.
        if (!serviceTargets || serviceTargets.length === 0) {
          return true;
        }
        const sum =
          serviceTargets.reduce((acc, serviceTarget) => {
            return acc + (serviceTarget?.percentage ?? 0);
          }, 0) || 0;
        return sum === 100;
      }
    )
    .required(),
});

export const UpdateRouteSchema = object({
  label: string(),
  protocol: string().oneOf(['tcp', 'http']),
  rules: array(RuleSchema),
});
