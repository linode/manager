import { cleanup, fireEvent, render } from '@testing-library/react';
import {} from 'history';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { firewalls } from 'src/__data__/firewalls';
import { firewallFactory } from 'src/factories/firewalls';
import { wrapWithTableBody } from 'src/utilities/testHelpers';
import {
  CombinedProps,
  FirewallRow,
  getCountOfRules,
  getRuleString
} from './FirewallRow';

afterEach(cleanup);

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
    const mockTriggerEditFirewall = jest.fn();
    const mockTriggerEnableFirewall = jest.fn();

    const baseProps: CombinedProps = {
      firewallID: 1,
      firewallLabel: firewall.label,
      firewallRules: firewall.rules,
      firewallStatus: firewall.status,
      triggerDeleteFirewall: mockTriggerDeleteFirewall,
      triggerDisableFirewall: mockTriggerDisableFirewall,
      triggerEditFirewall: mockTriggerEditFirewall,
      triggerEnableFirewall: mockTriggerEnableFirewall
    };

    it('renders a TableRow with label, status, rules, and Linodes', () => {
      const { getByTestId, getByText } = render(
        wrapWithTableBody(<FirewallRow {...baseProps} />)
      );
      getByTestId('firewall-row-1');
      getByText(firewall.label);
      getByText(firewall.status);
      getByText(getRuleString(getCountOfRules(firewall.rules)));
    });

    it('navigates to a Firewall Detail page when the row is clicked', () => {
      let history: any;

      const { getByTestId } = render(
        wrapWithTableBody(
          <>
            <FirewallRow {...baseProps} />
            {/* This bit of code changes the `history` object accessed by
            consumers of the router. It allows us to make assertions on
            `history`. Taken from the react-router documentation:
            https://reacttraining.com/react-router/web/guides/testing */}
            <Route
              path="*"
              render={routerProps => {
                history = routerProps.history;
                return null;
              }}
            />
          </>
        )
      );

      fireEvent.click(getByTestId('firewall-row-1'));
      expect(history.entries[history.entries.length - 1]).toHaveProperty(
        'pathname',
        '/firewalls/1'
      );
    });
  });
});
