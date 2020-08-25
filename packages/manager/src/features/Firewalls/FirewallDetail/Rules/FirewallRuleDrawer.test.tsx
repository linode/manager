import * as React from 'react';
import { allIPs } from 'src/features/Firewalls/shared';
import { stringToExtendedIP } from 'src/utilities/ipUtils';
import { renderWithTheme } from 'src/utilities/testHelpers';
import RuleDrawer, {
  classifyIPs,
  CombinedProps,
  deriveTypeFromValuesAndIPs,
  formValueToIPs,
  getInitialIPs,
  IP_ERROR_MESSAGE,
  validateForm,
  validateIPs
} from './FirewallRuleDrawer';
import { ExtendedFirewallRule } from './firewallRuleEditor';
import { FirewallRuleError } from './shared';

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

const props: CombinedProps = {
  category: 'inbound',
  mode: 'create',
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit
};

describe('AddRuleDrawer', () => {
  it('renders the title', () => {
    const { getByText } = renderWithTheme(
      <RuleDrawer {...props} mode="create" category="inbound" />
    );
    getByText('Add an Inbound Rule');
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
        ipv6: []
      });
      expect(formValueToIPs('allIPv6', [''].map(stringToExtendedIP))).toEqual({
        ipv4: [],
        ipv6: ['::0/0']
      });
      expect(
        formValueToIPs('ip/netmask', ['1.1.1.1'].map(stringToExtendedIP))
      ).toEqual({
        ipv4: ['1.1.1.1'],
        ipv6: []
      });
    });
  });

  describe('validateIPs', () => {
    it('adds errors to invalid IPs', () => {
      expect(
        validateIPs(['1.1.1.1', 'invalid-IP'].map(stringToExtendedIP))
      ).toEqual([
        { address: '1.1.1.1' },
        { address: 'invalid-IP', error: IP_ERROR_MESSAGE }
      ]);
    });
  });

  describe('validateForm', () => {
    it('validates protocol', () => {
      expect(validateForm()).toHaveProperty(
        'protocol',
        'Protocol is required.'
      );
    });
    it('validates ports', () => {
      expect(validateForm('ICMP', '80')).toHaveProperty(
        'ports',
        'Ports are not allowed for ICMP protocols.'
      );
      expect(validateForm('TCP')).toHaveProperty('ports');
      expect(validateForm('UDP')).toHaveProperty('ports');
      expect(validateForm('TCP', 'invalid-port')).toHaveProperty('ports');
    });
    it('accepts a valid form', () => {
      expect(validateForm('TCP', '22')).toEqual({});
    });
  });

  describe('getInitialIPs', () => {
    const ruleToModify: ExtendedFirewallRule = {
      ports: '80',
      protocol: 'TCP',
      status: 'NEW',
      addresses: {
        ipv4: ['1.2.3.4'],
        ipv6: ['::0']
      }
    };
    it('parses the IPs when no errors', () => {
      expect(getInitialIPs(ruleToModify)).toEqual([
        { address: '1.2.3.4' },
        { address: '::0' }
      ]);
    });
    it('parses the IPs with no errors', () => {
      const errors: FirewallRuleError[] = [
        {
          category: 'inbound',
          formField: 'addresses',
          idx: 1,
          reason: 'Invalid IP',
          ip: { idx: 0, type: 'ipv4' }
        }
      ];
      expect(getInitialIPs({ ...ruleToModify, errors })).toEqual([
        { address: '1.2.3.4', error: IP_ERROR_MESSAGE },
        { address: '::0' }
      ]);
    });
    it('offsets error indices correctly', () => {
      const result = getInitialIPs({
        ...ruleToModify,
        addresses: {
          ipv4: ['1.2.3.4'],
          ipv6: ['INVALID_IP']
        },
        errors: [
          {
            category: 'inbound',
            formField: 'addresses',
            idx: 1,
            reason: 'Invalid IP',
            ip: { idx: 0, type: 'ipv6' }
          }
        ]
      });
      expect(result).toEqual([
        { address: '1.2.3.4' },
        { address: 'INVALID_IP', error: IP_ERROR_MESSAGE }
      ]);
    });
  });

  describe('classifyIPs', () => {
    it('classifies v4 and v6', () => {
      expect(classifyIPs(['1.1.1.1', '0::0'].map(stringToExtendedIP))).toEqual({
        ipv4: ['1.1.1.1'],
        ipv6: ['0::0']
      });
    });
    it('accepts ranges', () => {
      expect(classifyIPs(['1.1.0.0/16'].map(stringToExtendedIP))).toEqual({
        ipv4: ['1.1.0.0/16'],
        ipv6: []
      });
    });
  });

  describe('deriveTypeFromValuesAndIPs', () => {
    const formValues = {
      addresses: 'all',
      ports: '443',
      protocol: 'TCP',
      type: ''
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
});
