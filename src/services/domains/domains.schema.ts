import { array, mixed, number, object, string } from 'yup';

export const importZoneSchema = object({
  domain: string().required('Domain is required.'),
  remote_nameserver: string().required('Remote nameserver is required.')
});

const domainSchemaBase = object().shape({
  domain: string().matches(
    /([a-zA-Z0-9-_]+\.)+([a-zA-Z]{2,3}\.)?([a-zA-Z]{2,16}|XN--[a-zA-Z0-9]+)/,
    'Domain is not valid.'
  ),
  status: mixed().oneOf(['disabled', 'active', 'edit_mode', 'has_errors']),
  tags: array(),
  description: string()
    .min(1, 'Description must be between 1 and 255 characters.')
    .max(255, 'Description must be between 1 and 255 characters.'),
  retry_sec: number(),
  master_ips: array().of(string()),
  axfr_ips: array()
    .of(string())
    .typeError('Must be a comma-separated list of IP addresses.'),
  expire_sec: number(),
  refresh_sec: number(),
  ttl_sec: number()
});

export const createDomainSchema = domainSchemaBase.shape({
  domain: string()
    .required('Domain is required.')
    .matches(
      /([a-zA-Z0-9-_]+\.)+([a-zA-Z]{2,3}\.)?([a-zA-Z]{2,16}|XN--[a-zA-Z0-9]+)/,
      'Domain is not valid.'
    ),
  type: mixed()
    .required()
    .oneOf(['master', 'slave']),
  soa_email: string()
    .when('type', {
      is: 'master',
      then: string().required('SOA Email is required.'),
      otherwise: string()
    })
    .email('SOA Email is not valid.')
});

export const updateDomainSchema = domainSchemaBase.shape({
  domainId: number(),
  soa_email: string().email('SOA Email is not valid.')
});
