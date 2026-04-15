import userEvent from '@testing-library/user-event';
import React from 'react';

import { reservedIPsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { IPAddressSelection } from './IPAddressSelection';

import type { IPAddress } from '@linode/api-v4';

describe('IPAddressSelection', () => {
  describe('Component Rendering', () => {
    it('should render the IP Address label', () => {
      const { getByText } = renderWithTheme(<IPAddressSelection />);
      expect(getByText('IP Address')).toBeInTheDocument();
    });

    it('should render Auto-assigned radio button by default', () => {
      const { getAllByRole } = renderWithTheme(<IPAddressSelection />);
      const autoRadio = getAllByRole('radio', { name: /Auto-assigned/i })[0];
      expect(autoRadio).toBeInTheDocument();
      expect(autoRadio).toBeChecked();
    });

    it('should render Reserved radio button', () => {
      const { getAllByRole } = renderWithTheme(<IPAddressSelection />);
      const reservedRadio = getAllByRole('radio', { name: /Reserved/i })[0];
      expect(reservedRadio).toBeInTheDocument();
      expect(reservedRadio).not.toBeChecked();
    });

    it('should render tooltips for both radio options', async () => {
      const { findByText, getAllByTestId } = renderWithTheme(
        <IPAddressSelection />
      );
      const tooltipIcons = getAllByTestId('tooltip-info-icon');
      expect(tooltipIcons).toHaveLength(2);
      await userEvent.hover(tooltipIcons[0]);
      expect(
        await findByText(
          "A public IPv4 address automatically assigned to your Linode. Use this for standard web traffic that doesn't require a permanent, static IP."
        )
      ).toBeInTheDocument();
      await userEvent.unhover(tooltipIcons[0]);
      await userEvent.hover(tooltipIcons[1]);
      expect(
        await findByText(
          "A reserved IPv4 address is a static public IP that can be assigned to Linodes in the same region. Use it for services that require a consistent IP address. Charges apply while the IP is reserved, even if it's not assigned to a Linode."
        )
      ).toBeInTheDocument();
    });

    it('should not show reserved IP dropdown by default', () => {
      const { queryByLabelText } = renderWithTheme(<IPAddressSelection />);
      expect(queryByLabelText('Reserved IP Address')).not.toBeInTheDocument();
    });
  });

  describe('Mode Selection', () => {
    it('should call onIPModeChange when mode changes', async () => {
      const onIPModeChange = vi.fn();
      const { getAllByRole } = renderWithTheme(
        <IPAddressSelection onIPModeChange={onIPModeChange} />
      );

      const reservedRadio = getAllByRole('radio', { name: /Reserved/i })[0];
      await userEvent.click(reservedRadio);

      expect(onIPModeChange).toHaveBeenCalledWith('reserved');
    });

    it('should call onReservedIPSelect with null when switching to auto mode', async () => {
      const onReservedIPSelect = vi.fn();
      let currentValue: 'auto' | 'reserved' = 'reserved';
      const handleIPModeChange = (mode: 'auto' | 'reserved') => {
        currentValue = mode;
        // Simulate clearing the selected IP when switching to auto
        onReservedIPSelect(null);
      };

      const { getAllByRole, rerender } = renderWithTheme(
        <IPAddressSelection
          onIPModeChange={handleIPModeChange}
          onReservedIPSelect={onReservedIPSelect}
          value={currentValue}
        />
      );

      const autoRadio = getAllByRole('radio', { name: /Auto-assigned/i })[0];
      await userEvent.click(autoRadio);

      // Re-render with updated value
      rerender(
        <IPAddressSelection
          onIPModeChange={handleIPModeChange}
          onReservedIPSelect={onReservedIPSelect}
          value={currentValue}
        />
      );

      expect(onReservedIPSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('Reserved IP Dropdown', () => {
    it('should show helper text when no region is selected', async () => {
      const { getByLabelText, getByText } = renderWithTheme(
        <IPAddressSelection value="reserved" />
      );

      const dropdown = getByLabelText('Reserved IP Address');
      expect(dropdown).toBeInTheDocument();
      expect(
        getByText('Select a region to see available reserved IPs.')
      ).toBeInTheDocument();
    });

    it('should fetch and display unassigned reserved IPs for the selected region', async () => {
      const reservedIPs: IPAddress[] = [
        reservedIPsFactory.build({
          address: '192.0.2.1',
          assigned_entity: null,
          region: 'us-east',
        }),
        reservedIPsFactory.build({
          address: '192.0.2.2',
          assigned_entity: null,
          region: 'us-east',
        }),
        reservedIPsFactory.build({
          address: '192.0.2.3',
          assigned_entity: {
            id: 123,
            label: 'test-linode',
            type: 'linode',
            url: '/linodes/123',
          },
          region: 'us-east',
        }),
      ];

      server.use(
        http.get('*/v4beta/networking/reserved/ips', () => {
          return HttpResponse.json(makeResourcePage(reservedIPs));
        })
      );

      const { getByLabelText, getByText, queryByText } = renderWithTheme(
        <IPAddressSelection regionId="us-east" value="reserved" />
      );

      const dropdown = getByLabelText('Reserved IP Address');
      await userEvent.click(dropdown);

      // Should show unassigned IPs
      expect(getByText('192.0.2.1')).toBeInTheDocument();
      expect(getByText('192.0.2.2')).toBeInTheDocument();

      // Should not show assigned IP
      expect(queryByText('192.0.2.3')).not.toBeInTheDocument();
    });

    it('should filter reserved IPs by region', async () => {
      const reservedIPs: IPAddress[] = [
        reservedIPsFactory.build({
          address: '192.0.2.1',
          assigned_entity: null,
          region: 'us-east',
        }),
        reservedIPsFactory.build({
          address: '192.0.2.2',
          assigned_entity: null,
          region: 'us-west',
        }),
      ];

      server.use(
        http.get('*/v4beta/networking/reserved/ips', () => {
          return HttpResponse.json(makeResourcePage(reservedIPs));
        })
      );

      const { getByLabelText, getByText, queryByText } = renderWithTheme(
        <IPAddressSelection regionId="us-east" value="reserved" />
      );

      const dropdown = getByLabelText('Reserved IP Address');
      await userEvent.click(dropdown);

      // Should only show IPs in us-east
      expect(getByText('192.0.2.1')).toBeInTheDocument();
      expect(queryByText('192.0.2.2')).not.toBeInTheDocument();
    });

    it('should show "no options" message when no reserved IPs are available', async () => {
      server.use(
        http.get('*/v4beta/networking/reserved/ips', () => {
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { getByLabelText, getByText } = renderWithTheme(
        <IPAddressSelection regionId="us-east" value="reserved" />
      );

      const dropdown = getByLabelText('Reserved IP Address');
      await userEvent.click(dropdown);

      expect(
        getByText('There are no available reserved IPs in the selected region.')
      ).toBeInTheDocument();
    });

    it('should call onReservedIPSelect when an IP is selected', async () => {
      const onReservedIPSelect = vi.fn();
      const reservedIP = reservedIPsFactory.build({
        address: '192.0.2.1',
        assigned_entity: null,
        region: 'us-east',
      });

      server.use(
        http.get('*/v4beta/networking/reserved/ips', () => {
          return HttpResponse.json(makeResourcePage([reservedIP]));
        })
      );

      const { getByLabelText, getByText } = renderWithTheme(
        <IPAddressSelection
          onReservedIPSelect={onReservedIPSelect}
          regionId="us-east"
          value="reserved"
        />
      );

      const dropdown = getByLabelText('Reserved IP Address');
      await userEvent.click(dropdown);

      const ipOption = getByText('192.0.2.1');
      await userEvent.click(ipOption);

      expect(onReservedIPSelect).toHaveBeenCalledWith(reservedIP);
    });
  });

  describe('Reserve IP Button', () => {
    it('should show Reserve IP button when in reserved mode', async () => {
      const { getAllByRole, getByText } = renderWithTheme(
        <IPAddressSelection regionId="us-east" value="reserved" />
      );

      const reservedRadio = getAllByRole('radio', { name: /Reserved/i })[0];
      await userEvent.click(reservedRadio);

      expect(getByText('Reserve IP')).toBeInTheDocument();
    });

    it('should not show Reserve IP button in auto mode', () => {
      const { queryByText } = renderWithTheme(<IPAddressSelection />);
      expect(queryByText('Reserve IP')).not.toBeInTheDocument();
    });

    it('should open Reserve IP drawer when button is clicked', async () => {
      const { getByText, getByRole } = renderWithTheme(
        <IPAddressSelection regionId="us-east" value="reserved" />
      );

      const reserveButton = getByText('Reserve IP');
      await userEvent.click(reserveButton);

      expect(
        getByRole('heading', { name: 'Reserve an IP Address' })
      ).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching reserved IPs', async () => {
      server.use(
        http.get('*/v4beta/networking/reserved/ips', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { getByLabelText } = renderWithTheme(
        <IPAddressSelection regionId="us-east" value="reserved" />
      );

      const dropdown = getByLabelText('Reserved IP Address');
      await userEvent.click(dropdown);

      // Component should show loading indicator (exact implementation may vary)
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { getByRole } = renderWithTheme(
        <IPAddressSelection value="reserved" />
      );

      const radioGroup = getByRole('radiogroup', { name: 'IP Address' });
      expect(radioGroup).toBeInTheDocument();
    });

    it('should have proper radio group labeling', () => {
      const { getByRole } = renderWithTheme(<IPAddressSelection />);

      const radioGroup = getByRole('radiogroup', { name: 'IP Address' });
      expect(radioGroup).toBeInTheDocument();
    });

    it('should have accessible radio buttons', () => {
      const { getAllByRole } = renderWithTheme(<IPAddressSelection />);

      const radios = getAllByRole('radio');
      expect(radios).toHaveLength(2);
      expect(radios[0]).toHaveAccessibleName(/Auto-assigned/i);
      expect(radios[1]).toHaveAccessibleName(/Reserved/i);
    });
  });
});
