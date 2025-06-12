import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { allIPs } from 'src/features/Firewalls/shared';
import { stringToExtendedIP } from 'src/utilities/ipUtils';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallRuleDrawer } from './FirewallRuleDrawer';
import {
  classifyIPs,
  deriveTypeFromValuesAndIPs,
  formValueToIPs,
  getInitialIPs,
  IP_ERROR_MESSAGE,
  itemsToPortString,
  portStringToItems,
  validateForm,
  validateIPs,
} from './FirewallRuleDrawer.utils';
import { PORT_PRESETS } from './shared';

import type { FirewallRuleDrawerProps } from './FirewallRuleDrawer.types';
import type { ExtendedFirewallRule } from './firewallRuleEditor';
import type { FirewallRuleError } from './shared';
import type { FirewallPolicyType } from '@linode/api-v4/lib/firewalls/types';

const mockOnClose = vi.fn();
const mockOnSubmit = vi.fn();

const baseItems = [PORT_PRESETS['22'], PORT_PRESETS['443']];

const props: FirewallRuleDrawerProps = {
  category: 'inbound',
  isOpen: true,
  mode: 'create',
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
};

describe('AddRuleDrawer', () => {
  it('renders the title', () => {
    const { getByText } = renderWithTheme(
      <FirewallRuleDrawer {...props} category="inbound" mode="create" />
    );
    getByText('Add an Inbound Rule');
  });

  it('disables the port input when the ICMP protocol is selected', async () => {
    const { getByText, getByPlaceholderText } = renderWithTheme(
      <FirewallRuleDrawer {...props} category="inbound" mode="create" />
    );
    expect(getByPlaceholderText('Select a port...')).not.toBeDisabled();
    await userEvent.click(getByPlaceholderText('Select a protocol...'));
    await userEvent.click(getByText('ICMP'));
    expect(getByPlaceholderText('Select a port...')).toBeDisabled();
  });

  it('disables the port input when the IPENCAP protocol is selected', async () => {
    const { getByText, getByPlaceholderText } = renderWithTheme(
      <FirewallRuleDrawer {...props} category="inbound" mode="create" />
    );
    expect(getByPlaceholderText('Select a port...')).not.toBeDisabled();
    await userEvent.click(getByPlaceholderText('Select a protocol...'));
    await userEvent.click(getByText('IPENCAP'));
    expect(getByPlaceholderText('Select a port...')).toBeDisabled();
  });
});

describe('utilities', () => {
  describe('formValueToIPs', () => {
    it('returns a complete set of IPs given a string form value', () => {
      expect(formValueToIPs('all', [''].map(stringToExtendedIP))).toEqual(
        allIPs
      );
      expect(formValueToIPs('allIPv4', [''].map(stringToExtendedIP))).toEqual({
        ipv4: ['0.0.0.0/0'],
      });
      expect(formValueToIPs('allIPv6', [''].map(stringToExtendedIP))).toEqual({
        ipv6: ['::/0'],
      });
      expect(
        formValueToIPs('ip/netmask', ['1.1.1.1'].map(stringToExtendedIP))
      ).toEqual({
        ipv4: ['1.1.1.1'],
      });
    });
  });

  describe('validateIPs', () => {
    it('adds errors to invalid IPs', () => {
      expect(
        validateIPs(['1.1.1.1/32', 'invalid-IP'].map(stringToExtendedIP))
      ).toEqual([
        { address: '1.1.1.1/32' },
        { address: 'invalid-IP', error: IP_ERROR_MESSAGE },
      ]);
    });
  });

  describe('validateForm', () => {
    it('validates protocol', () => {
      expect(validateForm({})).toHaveProperty(
        'protocol',
        'Protocol is required.'
      );
    });
    it('validates ports', () => {
      expect(validateForm({ ports: '80', protocol: 'ICMP' })).toHaveProperty(
        'ports',
        'Ports are not allowed for ICMP protocols.'
      );
      expect(
        validateForm({ ports: '443', protocol: 'IPENCAP' })
      ).toHaveProperty('ports', 'Ports are not allowed for IPENCAP protocols.');
      expect(
        validateForm({ ports: 'invalid-port', protocol: 'TCP' })
      ).toHaveProperty('ports');
    });
    it('validates custom ports', () => {
      const rest = {
        addresses: 'All IPv4',
        label: 'Firewalllabel',
      };
      // SUCCESS CASES
      expect(validateForm({ ports: '1234', protocol: 'TCP', ...rest })).toEqual(
        {}
      );
      expect(
        validateForm({ ports: '1,2,3,4,5', protocol: 'TCP', ...rest })
      ).toEqual({});
      expect(
        validateForm({ ports: '1, 2, 3, 4, 5', protocol: 'TCP', ...rest })
      ).toEqual({});
      expect(validateForm({ ports: '1-20', protocol: 'TCP', ...rest })).toEqual(
        {}
      );
      expect(
        validateForm({
          ports: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15',
          protocol: 'TCP',
          ...rest,
        })
      ).toEqual({});
      expect(
        validateForm({ ports: '1-2,3-4', protocol: 'TCP', ...rest })
      ).toEqual({});
      expect(
        validateForm({ ports: '1,5-12', protocol: 'TCP', ...rest })
      ).toEqual({});
      // FAILURE CASES
      expect(
        validateForm({ ports: '1,21-12', protocol: 'TCP', ...rest })
      ).toHaveProperty(
        'ports',
        'Range must start with a smaller number and end with a larger number'
      );
      expect(
        validateForm({ ports: '1-21-45', protocol: 'TCP', ...rest })
      ).toHaveProperty('ports', 'Ranges must have 2 values');
      expect(
        validateForm({ ports: 'abc', protocol: 'TCP', ...rest })
      ).toHaveProperty('ports', 'Must be 1-65535');
      expect(
        validateForm({ ports: '1--20', protocol: 'TCP', ...rest })
      ).toHaveProperty('ports', 'Must be 1-65535');
      expect(
        validateForm({ ports: '-20', protocol: 'TCP', ...rest })
      ).toHaveProperty('ports', 'Must be 1-65535');
      expect(
        validateForm({
          ports: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16',
          protocol: 'TCP',
          ...rest,
        })
      ).toHaveProperty(
        'ports',
        'Number of ports or port range endpoints exceeded. Max allowed is 15'
      );
    });
    it('validates label', () => {
      const expectedResults = [
        {
          result: {},
          value: 'test',
        },
        {
          result: {},
          value: 'accept-inbound-HTTP',
        },
        {
          result: {
            label: 'Label must be 3-32 characters.',
          },
          value: 'ab',
        },
        {
          result: {
            label: 'Label must be 3-32 characters.',
          },
          value: 'qwertyuiopasdfghjklzxcvbnm1234567890',
        },
        {
          result: {
            label: 'Label must begin with a letter.',
          },
          value: ' test',
        },
        {
          result: {
            label:
              'Label must include only ASCII letters, numbers, underscores, periods, and dashes.',
          },
          value: 'test ',
        },
        {
          result: {
            label:
              'Label must include only ASCII letters, numbers, underscores, periods, and dashes.',
          },
          value: 'b&a$e#c@!%^*()+=[]{}?/,<>~',
        },
      ];
      expectedResults.forEach(({ result, value }) => {
        const rest = {
          addresses: 'All IPv4',
          ports: '80',
          protocol: 'TCP',
        };
        expect(validateForm({ label: value, ...rest })).toEqual(result);
      });
    });
    it('handles required fields', () => {
      expect(validateForm({})).toEqual({
        addresses: 'Sources is a required field.',
        label: 'Label is required.',
        ports: 'Ports is a required field.',
        protocol: 'Protocol is required.',
      });
    });
  });

  describe('getInitialIPs', () => {
    const ruleToModify: ExtendedFirewallRule = {
      action: 'ACCEPT',
      addresses: {
        ipv4: ['1.2.3.4'],
        ipv6: ['::0'],
      },
      originalIndex: 0,
      ports: '80',
      protocol: 'TCP',
      status: 'NEW',
    };
    it('parses the IPs when no errors', () => {
      expect(getInitialIPs(ruleToModify)).toEqual([
        { address: '1.2.3.4' },
        { address: '::0' },
      ]);
    });
    it('parses the IPs with no errors', () => {
      const errors: FirewallRuleError[] = [
        {
          category: 'inbound',
          formField: 'addresses',
          idx: 1,
          ip: { idx: 0, type: 'ipv4' },
          reason: 'Invalid IP',
        },
      ];
      expect(getInitialIPs({ ...ruleToModify, errors })).toEqual([
        { address: '1.2.3.4', error: IP_ERROR_MESSAGE },
        { address: '::0' },
      ]);
    });
    it('offsets error indices correctly', () => {
      const result = getInitialIPs({
        ...ruleToModify,
        addresses: {
          ipv4: ['1.2.3.4'],
          ipv6: ['INVALID_IP'],
        },
        errors: [
          {
            category: 'inbound',
            formField: 'addresses',
            idx: 1,
            ip: { idx: 0, type: 'ipv6' },
            reason: 'Invalid IP',
          },
        ],
      });
      expect(result).toEqual([
        { address: '1.2.3.4' },
        { address: 'INVALID_IP', error: IP_ERROR_MESSAGE },
      ]);
    });
  });

  describe('classifyIPs', () => {
    it('classifies v4 and v6', () => {
      expect(classifyIPs(['1.1.1.1', '0::0'].map(stringToExtendedIP))).toEqual({
        ipv4: ['1.1.1.1'],
        ipv6: ['0::0'],
      });
    });
    it('accepts ranges', () => {
      expect(classifyIPs(['1.1.0.0/16'].map(stringToExtendedIP))).toEqual({
        ipv4: ['1.1.0.0/16'],
      });
    });
  });

  describe('deriveTypeFromValuesAndIPs', () => {
    const formValues = {
      action: 'DROP' as FirewallPolicyType,
      addresses: 'all',
      description: '',
      label: '',
      ports: '443',
      protocol: 'TCP',
      type: '',
    };

    it('correctly matches values to their representative type', () => {
      const result = deriveTypeFromValuesAndIPs(formValues, []);
      expect(result).toBe('https');
    });
    it('returns "custom" if there is no match', () => {
      const result = deriveTypeFromValuesAndIPs(
        { ...formValues, ports: '22-23' },
        []
      );
      expect(result).toBe('custom');
    });
  });

  describe('itemsToPortString', () => {
    it('should build a string based on selected items', () => {
      expect(itemsToPortString(baseItems)).toMatch('22, 443');
    });

    it('should ignore the CUSTOM item', () => {
      expect(
        itemsToPortString([...baseItems, { label: 'Custom', value: 'CUSTOM' }])
      ).toMatch('22, 443');
    });

    it('should return a single range covering all ports if any of the items has the value ALL', () => {
      expect(
        itemsToPortString([...baseItems, { label: 'All', value: 'ALL' }])
      ).toMatch('1-65535');
    });

    it('should combine presets and custom input', () => {
      expect(itemsToPortString(baseItems, '8080-8081')).toMatch(
        '22, 443, 8080-8081'
      );
    });

    it('should return the combined list in sorted order', () => {
      expect(itemsToPortString(baseItems, '8080, 1313-1515')).toMatch(
        '22, 443, 1313-1515, 8080'
      );
    });
  });

  describe('portStringToItems', () => {
    it('should turn matching default ports into the appropriate Item[]', () => {
      const [items, portString] = portStringToItems('80');
      expect(items).toEqual([PORT_PRESETS['80']]);
      expect(portString).toEqual('');
    });

    it('should handle multiple comma-separated values', () => {
      const [items, portString] = portStringToItems('443, 22');
      expect(items).toEqual([PORT_PRESETS['443'], PORT_PRESETS['22']]);
      expect(portString).toEqual('');
    });

    it('should handle custom ports and ranges', () => {
      const [items, portString] = portStringToItems('443, 22, 1111-2222');
      expect(items).toEqual([
        PORT_PRESETS['443'],
        PORT_PRESETS['22'],
        PORT_PRESETS['CUSTOM'],
      ]);
      expect(portString).toEqual('1111-2222');
    });

    it('should recognize that 1-65535 means open all ports', () => {
      const [items, portString] = portStringToItems('1-65535');
      expect(items).toEqual([PORT_PRESETS['ALL']]);
      expect(portString).toEqual('');
    });

    it('should handle duplicates', () => {
      const [items, portString] = portStringToItems('22, 443, 22');
      expect(items).toEqual([PORT_PRESETS['22'], PORT_PRESETS['443']]);
      expect(portString).toEqual('');
    });

    it('should handle empty input', () => {
      const [items, portString] = portStringToItems('');
      expect(items).toEqual([]);
      expect(portString).toEqual('');
    });
  });
});
