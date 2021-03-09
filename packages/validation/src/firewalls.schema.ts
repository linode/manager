import { parse as parseIP, parseCIDR } from 'ipaddr.js';
import { array, mixed, number, object, string } from 'yup';

export const IP_ERROR_MESSAGE =
  'Must be a valid IPv4 or IPv6 address or range.';

export const validateIP = (ipAddress: string) => {
  // We accept plain IPs as well as ranges (i.e. CIDR notation). Ipaddr.js has separate parsing
  // methods for each, so we check for a netmask to decide the method to use.
  const [, mask] = ipAddress.split('/');
  try {
    if (mask) {
      parseCIDR(ipAddress);
    } else {
      parseIP(ipAddress);
    }
  } catch (err) {
    // Empty addresses are OK for the sake of validating the form.
    if (ipAddress !== '') {
      return false;
    }
  }
  return true;
};

export const CreateFirewallDeviceSchema = object({
  linodes: array().of(number()),
  nodebalancers: array().of(number()),
});

export const ipAddress = string().test({
  name: 'validateIP',
  message: IP_ERROR_MESSAGE,
  test: validateIP,
});

export const validateFirewallPorts = string().matches(
  /^([0-9\-]+,?\s?)+$/,
  'Ports must be an integer, range of integers, or a comma-separated list of integers.'
);

const validFirewallRuleProtocol = ['ALL', 'TCP', 'UDP', 'ICMP'];
export const FirewallRuleTypeSchema = object().shape({
  action: mixed().oneOf(['ACCEPT', 'DROP']).required('Action is required'),
  protocol: mixed()
    .oneOf(validFirewallRuleProtocol)
    .required('Protocol is required.'),
  ports: string().when('protocol', {
    is: (val) => val !== 'ICMP',
    then: validateFirewallPorts,
    // Workaround to get the test to fail if ports is defined when protocol === ICMP
    otherwise: string().test({
      name: 'protocol',
      message: 'Ports are not allowed for ICMP protocols.',
      test: (value) => typeof value === 'undefined',
    }),
  }),
  addresses: object()
    .shape({
      ipv4: array().of(ipAddress).nullable(true),
      ipv6: array().of(ipAddress).nullable(true),
    })
    .strict(true)
    .nullable(true),
});

export const FirewallRuleSchema = object().shape({
  inbound: array(FirewallRuleTypeSchema).nullable(true),
  outbound: array(FirewallRuleTypeSchema).nullable(true),
  inbound_policy: mixed()
    .oneOf(['ACCEPT', 'DROP'])
    .required('Inbound policy is required.'),
  outbound_policy: mixed()
    .oneOf(['ACCEPT', 'DROP'])
    .required('Outbound policy is required.'),
});

export const CreateFirewallSchema = object().shape({
  label: string()
    .min(3, 'Label must be between 3 and 32 characters.')
    .max(32, 'Label must be between 3 and 32 characters.'),
  // Label validation on the back end is more complicated, we only do basic checks here.
  tags: array().of(string()),
  rules: FirewallRuleSchema,
});

export const UpdateFirewallSchema = object().shape({
  label: string(),
  tags: array().of(string()),
  status: string().oneOf(['enabled', 'disabled']), // 'deleted' is also a status but it's not settable
});

export const FirewallDeviceSchema = object({
  type: string()
    .oneOf(['linode', 'nodebalancer'])
    .required('Device type is required.'),
  id: number().required('ID is required.'),
});
