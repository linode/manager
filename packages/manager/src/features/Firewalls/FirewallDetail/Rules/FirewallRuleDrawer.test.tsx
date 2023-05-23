import { FirewallPolicyType } from '@linode/api-v4/lib/firewalls/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { allIPs } from 'src/features/Firewalls/shared';
import { stringToExtendedIP } from 'src/utilities/ipUtils';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  classifyIPs,
  deriveTypeFromValuesAndIPs,
  formValueToIPs,
  getInitialIPs,
  itemsToPortString,
  portStringToItems,
  IP_ERROR_MESSAGE,
  validateForm,
  validateIPs,
} from './FirewallRuleDrawer.utils';
import { FirewallRuleDrawer } from './FirewallRuleDrawer';
import { ExtendedFirewallRule } from './firewallRuleEditor';
import { FirewallRuleError, PORT_PRESETS } from './shared';
import type { FirewallRuleDrawerProps } from './FirewallRuleDrawer.types';

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

const baseItems = [PORT_PRESETS['22'], PORT_PRESETS['443']];

jest.mock('src/components/EnhancedSelect/Select');

const props: FirewallRuleDrawerProps = {
  category: 'inbound',
  mode: 'create',
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
};

describe('AddRuleDrawer', () => {
  it('renders the title', () => {
    const { getByText } = renderWithTheme(
      <FirewallRuleDrawer {...props} mode="create" category="inbound" />
    );
    getByText('Add an Inbound Rule');
  });

  it('disables the port input when the ICMP protocol is selected', () => {
    renderWithTheme(
      <FirewallRuleDrawer {...props} mode="create" category="inbound" />
    );
    expect(screen.getByLabelText('Ports')).not.toBeDisabled();
    userEvent.selectOptions(screen.getByPlaceholderText(/protocol/i), 'ICMP');
    expect(screen.getByLabelText('Ports')).toBeDisabled();
  });

  it('disables the port input when the IPENCAP protocol is selected', () => {
    renderWithTheme(
      <FirewallRuleDrawer {...props} mode="create" category="inbound" />
    );
    expect(screen.getByLabelText('Ports')).not.toBeDisabled();
    userEvent.selectOptions(
      screen.getByPlaceholderText(/protocol/i),
      'IPENCAP'
    );
    expect(screen.getByLabelText('Ports')).toBeDisabled();
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
      expect(validateForm({ protocol: 'ICMP', ports: '80' })).toHaveProperty(
        'ports',
        'Ports are not allowed for ICMP protocols.'
      );
      expect(
        validateForm({ protocol: 'IPENCAP', ports: '443' })
      ).toHaveProperty('ports', 'Ports are not allowed for IPENCAP protocols.');
      expect(
        validateForm({ protocol: 'TCP', ports: 'invalid-port' })
      ).toHaveProperty('ports');
    });
    it('validates custom ports', () => {
      const rest = {
        label: 'Firewalllabel',
        addresses: 'All IPv4',
      };
      expect(validateForm({ protocol: 'TCP', ports: '1', ...rest })).toEqual(
        {}
      );
      expect(
        validateForm({ protocol: 'TCP', ports: '1,2,3,4,5', ...rest })
      ).toEqual({});
      expect(
        validateForm({ protocol: 'TCP', ports: '1, 2, 3, 4, 5', ...rest })
      ).toEqual({});
      expect(validateForm({ protocol: 'TCP', ports: '1-20', ...rest })).toEqual(
        {}
      );
      expect(
        validateForm({ protocol: 'TCP', ports: 'abc', ...rest })
      ).toHaveProperty(
        'ports',
        'Ports must be an integer, range of integers, or a comma-separated list of integers.'
      );
      expect(
        validateForm({ protocol: 'TCP', ports: '1--20', ...rest })
      ).toHaveProperty(
        'ports',
        'Ports must be an integer, range of integers, or a comma-separated list of integers.'
      );
      expect(
        validateForm({ protocol: 'TCP', ports: '1-2,3-4', ...rest })
      ).toHaveProperty(
        'ports',
        'Ports must be an integer, range of integers, or a comma-separated list of integers.'
      );
      expect(
        validateForm({ protocol: 'TCP', ports: '-20', ...rest })
      ).toHaveProperty(
        'ports',
        'Ports must be an integer, range of integers, or a comma-separated list of integers.'
      );
    });
    it('validates label', () => {
      const expectedResults = [
        {
          value: 'test',
          result: {},
        },
        {
          value: 'accept-inbound-HTTP',
          result: {},
        },
        {
          value: 'ab',
          result: {
            label: 'Label must be 3-32 characters.',
          },
        },
        {
          value: 'qwertyuiopasdfghjklzxcvbnm1234567890',
          result: {
            label: 'Label must be 3-32 characters.',
          },
        },
        {
          value: ' test',
          result: {
            label: 'Label must begin with a letter.',
          },
        },
        {
          value: 'test ',
          result: {
            label:
              'Label must include only ASCII letters, numbers, underscores, periods, and dashes.',
          },
        },
        {
          value: 'b&a$e#c@!%^*()+=[]{}?/,<>~',
          result: {
            label:
              'Label must include only ASCII letters, numbers, underscores, periods, and dashes.',
          },
        },
      ];
      expectedResults.forEach(({ value, result }) => {
        const rest = {
          protocol: 'TCP',
          ports: '80',
          addresses: 'All IPv4',
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
      ports: '80',
      protocol: 'TCP',
      status: 'NEW',
      action: 'ACCEPT',
      originalIndex: 0,
      addresses: {
        ipv4: ['1.2.3.4'],
        ipv6: ['::0'],
      },
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
          reason: 'Invalid IP',
          ip: { idx: 0, type: 'ipv4' },
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
            reason: 'Invalid IP',
            ip: { idx: 0, type: 'ipv6' },
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
      ports: '443',
      protocol: 'TCP',
      type: '',
      label: '',
      description: '',
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
        itemsToPortString([...baseItems, { value: 'CUSTOM', label: 'Custom' }])
      ).toMatch('22, 443');
    });

    it('should return a single range covering all ports if any of the items has the value ALL', () => {
      expect(
        itemsToPortString([...baseItems, { value: 'ALL', label: 'All' }])
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

    it('should handle empty input', () => {
      const [items, portString] = portStringToItems('');
      expect(items).toEqual([]);
      expect(portString).toEqual('');
    });
  });
});
