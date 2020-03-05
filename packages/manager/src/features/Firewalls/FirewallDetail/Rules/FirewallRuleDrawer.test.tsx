import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { allIPs } from 'src/features/Firewalls/shared';
import { renderWithTheme } from 'src/utilities/testHelpers';
import RuleDrawer, {
  classifyIPs,
  CombinedProps,
  deriveTypeFromValuesAndIPs,
  formValueToIPs
} from './FirewallRuleDrawer';

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();

const props: CombinedProps = {
  category: 'inbound',
  mode: 'create',
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit
};

afterEach(cleanup);

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
      expect(formValueToIPs('all', [''])).toEqual(allIPs);
      expect(formValueToIPs('allIPv4', [''])).toEqual({
        ipv4: ['0.0.0.0/0'],
        ipv6: []
      });
      expect(formValueToIPs('allIPv6', [''])).toEqual({
        ipv4: [],
        ipv6: ['::0/0']
      });
      expect(formValueToIPs('ip/netmask', ['1.1.1.1'])).toEqual({
        ipv4: ['1.1.1.1'],
        ipv6: []
      });
    });
  });

  describe('classifyIPs', () => {
    it('classifies v4 and v6', () => {
      expect(classifyIPs(['1.1.1.1', '0::0'])).toEqual({
        ipv4: ['1.1.1.1'],
        ipv6: ['0::0']
      });
    });
    it('ignores bad input', () => {
      expect(classifyIPs(['1.1.1.1', 'hello-world'])).toEqual({
        ipv4: ['1.1.1.1'],
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
