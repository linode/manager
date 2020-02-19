import { array, number, object, string } from 'yup';

export const CreateFirewallDeviceSchema = object({
  linodes: array().of(number()),
  nodebalancers: array().of(number())
});

export const CreateFirewallSchema = object({
  label: string(),
  tags: array().of(string()),
  rules: object().required('You must provide a set of Firewall rules.')
});

export const UpdateFirewallSchema = object().shape({
  label: string(),
  tags: array().of(string()),
  status: string().oneOf(['enabled', 'disabled']) // 'deleted' is also a status but it's not settable
});

export const FirewallDeviceSchema = object({
  type: string()
    .oneOf(['linode', 'nodebalancer'])
    .required('Device type is required.'),
  id: number().required('ID is required.')
});
