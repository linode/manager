import {
  CUSTOM_PORTS_ERROR_MESSAGE,
  isCustomPortsValid,
} from '@linode/validation';
import { parseCIDR, parse as parseIP } from 'ipaddr.js';

import {
  allIPs,
  allIPv4,
  allIPv6,
  allowAllIPv4,
  allowAllIPv6,
  allowNoneIPv4,
  allowNoneIPv6,
  allowsAllIPs,
  predefinedFirewallFromRule,
} from 'src/features/Firewalls/shared';
import { stringToExtendedIP } from 'src/utilities/ipUtils';

import { PORT_PRESETS, sortString } from './shared';

import type { FormState } from './FirewallRuleDrawer.types';
import type { ExtendedFirewallRule } from './firewallRuleEditor';
import type {
  FirewallRuleProtocol,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import type { FirewallOptionItem } from 'src/features/Firewalls/shared';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export const IP_ERROR_MESSAGE = 'Must be a valid IPv4 or IPv6 range.';

/**
 * Derive the appropriate value of the "Type" field based on selected form
 * values and IP addresses.
 *
 * Example: A user selects the "HTTPS" type. The appropriate value is "HTTPS".
 * Next, the user modifies the allowed IP addresses. Now the appropriate value
 * is "custom", since the form no longer matches the predefined "HTTPS" type.
 * Finally, the user changes their mind and removes the custom IP selection.
 * The form again matches the "HTTPS" type, so the correct value is "HTTPS".
 */
export const deriveTypeFromValuesAndIPs = (
  values: FormState,
  ips: ExtendedIP[]
) => {
  if (values.type === 'custom') {
    return 'custom';
  }

  const protocol = values.protocol as FirewallRuleProtocol;

  const predefinedFirewall = predefinedFirewallFromRule({
    action: 'ACCEPT',
    addresses: formValueToIPs(values.addresses, ips),
    ports: values.ports,
    protocol,
  });

  if (predefinedFirewall) {
    return predefinedFirewall;
  } else if (
    values.protocol?.length > 0 ||
    (values.ports && values.ports?.length > 0) ||
    values.addresses?.length > 0
  ) {
    return 'custom';
  }
  return null;
};

/**
 * Matches potential form values to the correct "addresses" payload.
 */
export const formValueToIPs = (
  formValue: string,
  ips: ExtendedIP[]
): FirewallRuleType['addresses'] => {
  switch (formValue) {
    case 'all':
      return allIPs;
    case 'allIPv4':
      return { ipv4: [allIPv4] };
    case 'allIPv6':
      return { ipv6: [allIPv6] };
    default:
      // The user has selected "IP / Netmask" and entered custom IPs, so we need
      // to separate those into v4 and v6 addresses.
      return classifyIPs(ips);
  }
};

// Adds an `error` message to each invalid IP in the list.
export const validateIPs = (
  ips: ExtendedIP[],
  options?: { allowEmptyAddress: boolean }
): ExtendedIP[] => {
  return ips.map(({ address }) => {
    if (!options?.allowEmptyAddress && !address) {
      return { address, error: 'Please enter an IP address.' };
    }
    // We accept IP ranges (i.e., CIDR notation). By the time this function is run,
    // IP masks will have been enforced by enforceIPMasks().
    try {
      parseCIDR(address);
    } catch (err) {
      if (address) {
        return { address, error: IP_ERROR_MESSAGE };
      }
    }
    return { address };
  });
};

/**
 * Given an array of IP addresses, filter out invalid addresses and categorize
 * them by "ipv4" and "ipv6."
 */
export const classifyIPs = (ips: ExtendedIP[]) => {
  return ips.reduce<{ ipv4?: string[]; ipv6?: string[] }>(
    (acc, { address }) => {
      // Unfortunately ipaddr.js can't determine the "type" of an IPv6 address with a mask, so we
      // need to parse the base address only and THEN determine the type.
      const [base] = address.split('/');
      try {
        const parsed = parseIP(base);
        const type = parsed.kind();
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type]!.push(address);
      } catch {
        // No need to do anything here (validation will have already caught errors).
      }
      return acc;
    },
    {}
  );
};

const initialValues: FormState = {
  action: 'ACCEPT',
  addresses: '',
  description: '',
  label: '',
  ports: '',
  protocol: '',
  type: '',
};

export const getInitialFormValues = (
  ruleToModify?: ExtendedFirewallRule
): FormState => {
  if (!ruleToModify) {
    return initialValues;
  }

  return {
    action: ruleToModify.action,
    addresses: getInitialAddressFormValue(ruleToModify.addresses),
    description: ruleToModify?.description || '',
    label: ruleToModify?.label || '',
    ports: portStringToItems(ruleToModify.ports)[1],
    protocol: ruleToModify.protocol,
    type: predefinedFirewallFromRule(ruleToModify) || '',
  };
};

export const getInitialAddressFormValue = (
  addresses: ExtendedFirewallRule['addresses']
): string => {
  if (allowsAllIPs(addresses)) {
    return 'all';
  }

  if (allowAllIPv4(addresses) && allowNoneIPv6(addresses)) {
    return 'allIPv4';
  }

  if (allowAllIPv6(addresses) && allowNoneIPv4(addresses)) {
    return 'allIPv6';
  }

  return 'ip/netmask';
};

// Get a list of Extended IP from an existing Firewall rule. This is necessary when opening the
// drawer/form to modify an existing rule.
export const getInitialIPs = (
  ruleToModify: ExtendedFirewallRule
): ExtendedIP[] => {
  const { addresses } = ruleToModify;

  const extendedIPv4 = (addresses?.ipv4 ?? []).map(stringToExtendedIP);
  const extendedIPv6 = (addresses?.ipv6 ?? []).map(stringToExtendedIP);

  const ips: ExtendedIP[] = [...extendedIPv4, ...extendedIPv6];

  ruleToModify.errors?.forEach((thisError) => {
    const { formField, ip } = thisError;

    if (formField !== 'addresses' || !ip) {
      return;
    }

    /**
     * This is a trip, but we may have to offset the IP index. An example: The IPs we give to the
     * API might look like:
     *
     *  {
     *    ipv4: ['1.2.3.4'],
     *    ipv6: ['INVALID_IP']
     *  }
     *
     * The API will return an error explaining that `ipv6[0]` is invalid. In this form, our list of
     * IPs looks like: ['1.2.3.4', 'INVALID_IP'], so we can't rely solely on the index from the
     * API... we've got to offset it by the length of the v4 IPs. This works because we place v4 IPs
     * first in the list when modifying an existing rule.
     */
    const index =
      ip.type === 'ipv4' ? ip.idx : (addresses?.ipv4?.length ?? 0 + ip.idx);

    ips[index].error = IP_ERROR_MESSAGE;
  });

  return ips;
};

/**
 * Take the value of the Ports select (which contains presets)
 * and combine it with any custom user input to create a string
 * that the API will accept.
 *
 * Examples:
 *
 * portSelect = [ { value: 22, label: 'ssh' }, { value: 443, label: 'https' }]
 * values.ports = "8080, 1313-1515"
 *
 * output: '22, 443, 1313-1515, 8080'
 */
export const itemsToPortString = (
  items: FirewallOptionItem<string>[],
  portInput?: string
): string | undefined => {
  // If a user has selected ALL, just return that; anything else in the string
  // will be redundant.
  if (items.findIndex((thisItem) => thisItem.value === 'ALL') > -1) {
    return '1-65535';
  }
  // Take the values, excluding "CUSTOM" since that just indicates there was custom user input.
  const presets = items.map((i) => i.value).filter((i) => i !== 'CUSTOM');
  const customArray = (portInput ?? '')
    .split(',')
    .map((port) => port.trim())
    .filter(Boolean);
  return Array.from(new Set([...presets, ...customArray]))
    .sort(sortString)
    .join(', ');
};

/**
 *
 * Inverse of itemsToPortString. Takes a string from an API response (or row value)
 * and converts it to FirewallOptionItem<string>[] and a custom input string.
 */
export const portStringToItems = (
  portString?: string
): [FirewallOptionItem<string>[], string] => {
  // Handle empty input
  if (!portString) {
    return [[], ''];
  }

  // If this string is included, all ports are allowed.
  if (portString.match(/1-65535/)) {
    return [[PORT_PRESETS['ALL']], ''];
  }

  const ports = portString.split(',').map((p) => p.trim());
  const items: FirewallOptionItem<string>[] = [];
  const customInput: string[] = [];

  for (const port of ports) {
    if (
      port in PORT_PRESETS && 
      items.some(
        (i) => i.value === PORT_PRESETS[port as keyof typeof PORT_PRESETS].value
      )
    ) {
      // If we have already added the port preset to our `items` array, just skip it
      // to avoid duplicate options
      continue;
    }

    if (port in PORT_PRESETS) {
      items.push(PORT_PRESETS[port as keyof typeof PORT_PRESETS]);
    } else {
      customInput.push(port);
    }
  }

  if (customInput.length > 0) {
    items.push({ label: 'Custom', value: 'CUSTOM' });
  }
  return [items, customInput.join(', ')];
};

export const validateForm = ({
  addresses,
  description,
  label,
  ports,
  protocol,
}: Partial<FormState>) => {
  const errors: Partial<FormState> = {};

  if (label) {
    if (label.length < 3 || label.length > 32) {
      errors.label = 'Label must be 3-32 characters.';
    } else if (/^[^a-z]/i.test(label)) {
      errors.label = 'Label must begin with a letter.';
    } else if (/[^0-9a-z._-]+/i.test(label)) {
      errors.label =
        'Label must include only ASCII letters, numbers, underscores, periods, and dashes.';
    }
  } else {
    errors.label = 'Label is required.';
  }

  if (description && description.length > 100) {
    errors.description = 'Description must be 1-100 characters.';
  }

  if (!protocol) {
    errors.protocol = 'Protocol is required.';
  }

  if (!addresses) {
    errors.addresses = 'Sources is a required field.';
  }

  if (!ports && protocol !== 'ICMP' && protocol !== 'IPENCAP') {
    errors.ports = 'Ports is a required field.';
  }

  if ((protocol === 'ICMP' || protocol === 'IPENCAP') && ports) {
    errors.ports = `Ports are not allowed for ${protocol} protocols.`;
  } else if (ports && !isCustomPortsValid(ports)) {
    errors.ports = CUSTOM_PORTS_ERROR_MESSAGE;
  }

  return errors;
};

export const enforceIPMasks = (ips: ExtendedIP[]): ExtendedIP[] => {
  // Check if a mask was provided and if not, add the appropriate mask for IPv4 or IPv6 addresses, respectively.
  return ips.map((extendedIP) => {
    const ipAddress = extendedIP.address;

    const [base, mask] = ipAddress.split('/');
    if (mask) {
      // The user provided a mask already
      return extendedIP;
    }

    try {
      const parsed = parseIP(base);
      const type = parsed.kind();

      const appendedMask = type === 'ipv4' ? '/32' : '/128';
      const ipWithMask = base + appendedMask;

      return { ...extendedIP, address: ipWithMask };
    } catch (err) {
      return extendedIP;
    }
  });
};
