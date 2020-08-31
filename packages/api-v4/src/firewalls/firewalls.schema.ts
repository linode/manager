import { array, mixed, number, object, string } from 'yup';

export const CreateFirewallDeviceSchema = object({
  linodes: array().of(number()),
  nodebalancers: array().of(number())
});

const validFirewallRuleProtocol = ['ALL', 'TCP', 'UDP', 'ICMP'];
const FirewallRuleTypeSchema = object().shape({
  protocol: mixed()
    .oneOf(validFirewallRuleProtocol)
    .required(),
  ports: string().required(),
  addresses: object()
    .shape({
      ipv4: array()
        .of(string())
        .nullable(true),
      ipv6: array()
        .of(string())
        .nullable(true)
    })
    .nullable(true)
});

export const FirewallRuleSchema = object().shape({
  inbound: array(FirewallRuleTypeSchema).nullable(true),
  outbound: array(FirewallRuleTypeSchema).nullable(true)
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
