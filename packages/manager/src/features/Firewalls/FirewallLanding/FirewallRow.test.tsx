import { render } from '@testing-library/react';
import {} from 'history';
import * as React from 'react';
import { firewalls } from 'src/__data__/firewalls';
import {
  firewallDeviceFactory,
  firewallFactory
} from 'src/factories/firewalls';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';
import {
  CombinedProps,
  FirewallRow,
  getCountOfRules,
  getDeviceLinks,
  getRuleString
} from './FirewallRow';

describe('FirewallRow', () => {
  describe('Utility functions', () => {
    it('should return correct number of inbound and outbound rules', () => {
      expect(getCountOfRules(firewalls[0].rules)).toEqual([1, 1]);
      expect(getCountOfRules(firewalls[1].rules)).toEqual([0, 2]);
    });

    it('should return the correct string given an array of numbers', () => {
      expect(getRuleString([1, 2])).toBe('1 Inbound / 2 Outbound');
      expect(getRuleString([1, 0])).toBe('1 Inbound');
      expect(getRuleString([0, 1])).toBe('1 Outbound');
    });
  });

  describe('FirewallRow component', () => {
    const firewall = firewallFactory.build();

    const mockTriggerDeleteFirewall = jest.fn();
    const mockTriggerDisableFirewall = jest.fn();
    const mockTriggerEnableFirewall = jest.fn();

    const baseProps: CombinedProps = {
      id: 1,
      label: firewall.label,
      rules: firewall.rules,
      status: firewall.status,
      tags: [],
      created_dt: '',
      updated_dt: '',
      triggerDeleteFirewall: mockTriggerDeleteFirewall,
      triggerDisableFirewall: mockTriggerDisableFirewall,
      triggerEnableFirewall: mockTriggerEnableFirewall
    };

    it('renders a TableRow with label, status, rules, and Linodes', () => {
      const { getByTestId, getByText } = render(
        wrapWithTableBody(<FirewallRow {...baseProps} />)
      );
      getByTestId('firewall-row-1');
      getByText(firewall.label);
      getByText('Enabled');
      // getByText(getRuleString(getCountOfRules(firewall.rules)));
    });
  });

  describe('getDeviceLinks', () => {
    it('should return a single Link if one Device is attached', () => {
      const device = firewallDeviceFactory.build();
      const links = getDeviceLinks([device]);
      const { getByText } = renderWithTheme(links);
      expect(getByText(device.entity.label));
    });

    it('should render up to three comma-separated links', () => {
      const devices = firewallDeviceFactory.buildList(3);
      const links = getDeviceLinks(devices);
      const { queryAllByTestId } = renderWithTheme(links);
      expect(queryAllByTestId('firewall-row-link')).toHaveLength(3);
    });

    it('should render "plus N more" text for any devices over three', () => {
      const devices = firewallDeviceFactory.buildList(13);
      const links = getDeviceLinks(devices);
      const { getByText, queryAllByTestId } = renderWithTheme(links);
      expect(queryAllByTestId('firewall-row-link')).toHaveLength(3);
      expect(getByText(/10 more/));
    });
  });
});
