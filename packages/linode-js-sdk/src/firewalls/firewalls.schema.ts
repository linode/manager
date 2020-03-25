import { array, number, object, string } from 'yup';

export const CreateFirewallDeviceSchema = object({
  linodes: array().of(number()),
  nodebalancers: array().of(number())
});

export const FirewallRuleSchema = object().shape({
  inbound: array().required('You must provide a set of Firewall rules.'),
  outbound: array().required('You must provide a set of Firewall rules.')
});

export const CreateFirewallSchema = object().shape({
  label: string()
    .min(3, 'Label must be between 3 and 32 characters.')
    .max(32, 'Label must be between 3 and 32 characters.'),
  // Label validation on the back end is more complicated, we only do basic checks here.
  tags: array().of(string()),
  rules: FirewallRuleSchema
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
