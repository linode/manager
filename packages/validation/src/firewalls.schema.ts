// We must use a default export for ipaddr.js so our packages node compatability
// Refer to https://github.com/linode/manager/issues/8675
import ipaddr from 'ipaddr.js';
import { array, mixed, number, object, string } from 'yup';

export const IP_ERROR_MESSAGE =
  'Must be a valid IPv4 or IPv6 address or range.';
// export const CUSTOM_PORTS_ERROR_MESSAGE =
//   'Ports must be an integer, range of integers, or a comma-separated list of integers.';
export const CUSTOM_PORTS_VALIDATION_REGEX = /^(?:\d+|\d+-\d+|(?:\d+,\s*)*\d+)$/;

export const validateIP = (ipAddress?: string | null): boolean => {
  if (!ipAddress) {
    return false;
  }
  // We accept plain IPs as well as ranges (i.e. CIDR notation). Ipaddr.js has separate parsing
  // methods for each, so we check for a netmask to decide the method to use.
  const [, mask] = ipAddress.split('/');
  try {
    if (mask) {
      ipaddr.parseCIDR(ipAddress);
    } else {
      ipaddr.parse(ipAddress);
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

export let CUSTOM_PORTS_ERROR_MESSAGE =
  'Ports must be an integer, range of integers, or a comma-separated list of integers.';

const validatePort = (port: string): boolean => {
  if (!port) {
    CUSTOM_PORTS_ERROR_MESSAGE = 'Must be 1-65535';
    return false;
  }

  const convertedPort = parseInt(port, 10);
  if (!(1 <= convertedPort && convertedPort <= 65535)) {
    CUSTOM_PORTS_ERROR_MESSAGE = 'Must be 1-65535';
    return false;
  }

  if (String(convertedPort) !== port) {
    CUSTOM_PORTS_ERROR_MESSAGE = 'Port must not have leading zeroes';
    return false;
  }

  return true;
};

export const runCustomPortsValidation = (value: string): boolean => {
  const portList = value?.split(',') || [];
  let portLimitCount = 0;

  for (const port of portList) {
    const cleanedPort = port.trim();

    if (cleanedPort.includes('-')) {
      const portRange = cleanedPort.split('-');

      if (!validatePort(portRange[0]) || !validatePort(portRange[1])) {
        return false;
      }

      if (portRange.length !== 2) {
        CUSTOM_PORTS_ERROR_MESSAGE = 'Ranges must have 2 values';
        return false;
      }

      if (parseInt(portRange[0], 10) >= parseInt(portRange[1], 10)) {
        CUSTOM_PORTS_ERROR_MESSAGE =
          'Range must start with a smaller number and end with a larger number';
        return false;
      }

      portLimitCount += 2;
    } else {
      if (!validatePort(cleanedPort)) {
        return false;
      }
      portLimitCount++;
    }
  }

  if (portLimitCount > 15) {
    CUSTOM_PORTS_ERROR_MESSAGE =
      'Number of ports or port range endpoints exceeded. Max allowed is 15';
    return false;
  }

  return true;
};

const validateFirewallPorts = string().test({
  name: 'firewall-ports',
  message: CUSTOM_PORTS_ERROR_MESSAGE,
  test: (value) => {
    if (!value) {
      return false;
    }

    try {
      runCustomPortsValidation(value);
    } catch (err) {
      return false;
    }
    return true;
  },
});

const validFirewallRuleProtocol = ['ALL', 'TCP', 'UDP', 'ICMP', 'IPENCAP'];
export const FirewallRuleTypeSchema = object().shape({
  action: mixed().oneOf(['ACCEPT', 'DROP']).required('Action is required'),
  protocol: mixed()
    .oneOf(validFirewallRuleProtocol)
    .required('Protocol is required.'),
  ports: string().when('protocol', {
    is: (val: any) => val !== 'ICMP' && val !== 'IPENCAP',
    then: validateFirewallPorts,
    // Workaround to get the test to fail if ports is defined when protocol === ICMP or IPENCAP
    otherwise: string().test({
      name: 'protocol',
      message: 'Ports are not allowed for ICMP and IPENCAP protocols.',
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
    .required('Label is required.')
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
