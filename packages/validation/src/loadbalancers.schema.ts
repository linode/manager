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
  rate_capacity: number().required(),
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
