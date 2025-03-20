// We must use a default export for ipaddr.js so our packages node compatability
// Refer to https://github.com/linode/manager/issues/8675
import ipaddr from 'ipaddr.js';
import { array, number, object, string } from 'yup';

export const IP_ERROR_MESSAGE =
  'Must be a valid IPv4 or IPv6 address or range.';

export const validateIP = (ipAddress?: string | null): boolean => {
  // ''is falsy, so we must specify that it is OK
  if (ipAddress !== '' && !ipAddress) {
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

export const ipAddress = string().defined().test({
  name: 'validateIP',
  message: IP_ERROR_MESSAGE,
  test: validateIP,
});

export let CUSTOM_PORTS_ERROR_MESSAGE = '';

/**
 * @param port
 * @returns boolean
 * @description Validates a single port or port range and sets the error message
 */
const validatePort = (port: string): boolean => {
  CUSTOM_PORTS_ERROR_MESSAGE =
    'Ports must be an integer, range of integers, or a comma-separated list of integers.';

  if (!port) {
    CUSTOM_PORTS_ERROR_MESSAGE = 'Must be 1-65535';
    return false;
  }

  const convertedPort = parseInt(port, 10);
  if (!(1 <= convertedPort && convertedPort <= 65535)) {
    CUSTOM_PORTS_ERROR_MESSAGE = 'Must be 1-65535';
    return false;
  }

  if (port.startsWith('0')) {
    CUSTOM_PORTS_ERROR_MESSAGE = 'Port must not have leading zeroes';
    return false;
  }

  if (String(convertedPort) !== port) {
    return false;
  }

  return true;
};

/**
 * @param ports
 * @returns boolean
 * @description Validates a comma-separated list of ports and port ranges and sets the error message
 */
export const isCustomPortsValid = (ports: string): boolean => {
  const portList = ports?.split(',') || [];
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
      isCustomPortsValid(value);
    } catch (err) {
      return false;
    }
    return true;
  },
});

export const FirewallRuleTypeSchema = object().shape({
  action: string().oneOf(['ACCEPT', 'DROP']).required('Action is required'),
  description: string().nullable(),
  label: string().nullable(),
  protocol: string()
    .oneOf(['ALL', 'TCP', 'UDP', 'ICMP', 'IPENCAP'])
    .required('Protocol is required.'),
  ports: string().when('protocol', {
    is: (val: any) => val !== 'ICMP' && val !== 'IPENCAP',
    then: () => validateFirewallPorts,
    // Workaround to get the test to fail if ports is defined when protocol === ICMP or IPENCAP
    otherwise: (schema) =>
      schema.test({
        name: 'protocol',
        message: 'Ports are not allowed for ICMP and IPENCAP protocols.',
        test: (value) => typeof value === 'undefined',
      }),
  }),
  addresses: object()
    .shape({
      ipv4: array().of(ipAddress).nullable(),
      ipv6: array().of(ipAddress).nullable(),
    })
    .strict(true)
    .notRequired()
    .nullable(),
});

export const FirewallRuleSchema = object().shape({
  inbound: array(FirewallRuleTypeSchema).nullable(),
  outbound: array(FirewallRuleTypeSchema).nullable(),
  inbound_policy: string()
    .oneOf(['ACCEPT', 'DROP'])
    .required('Inbound policy is required.'),
  outbound_policy: string()
    .oneOf(['ACCEPT', 'DROP'])
    .required('Outbound policy is required.'),
});

const CreateFirewallDevicesSchema = object()
  .shape({
    linodes: array().of(number().defined()),
    nodebalancers: array().of(number().defined()),
    interfaces: array().of(number().defined()),
  })
  .notRequired();

export const CreateFirewallSchema = object().shape({
  label: string()
    .required('Label is required.')
    .min(3, 'Label must be between 3 and 32 characters.')
    .max(32, 'Label must be between 3 and 32 characters.'),
  // Label validation on the back end is more complicated, we only do basic checks here.
  tags: array().of(string().defined()),
  rules: FirewallRuleSchema,
  devices: CreateFirewallDevicesSchema,
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

export const UpdateFirewallSettingsSchema = object({
  default_firewall_ids: object({
    interface_public: number().nullable(),
    interface_vpc: number().nullable(),
    linode: number().nullable(),
    nodebalancer: number().nullable(),
  }),
});
