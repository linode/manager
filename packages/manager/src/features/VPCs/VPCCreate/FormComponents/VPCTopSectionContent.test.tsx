import { regionFactory, regionVPCAvailabilityFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VPCTopSectionContent } from './VPCTopSectionContent';

const props = {
  regions: [],
};

describe('VPC Top Section form content', () => {
  it('renders the vpc top section form content correctly', () => {
    renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
      // @TODO VPC IPv6: Remove this flag check once VPC IPv6 is in GA
      options: {
        flags: {
          vpcIpv6: false,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
        },
      },
    });

    expect(screen.getByText('Region')).toBeVisible();
    expect(screen.getByText('VPC Label')).toBeVisible();
    expect(screen.getByText('Description')).toBeVisible();
    // @TODO VPC IPv6: Remove this check once VPC IPv6 is in GA
    expect(screen.queryByText('IP Stack')).not.toBeInTheDocument();
  });

  it('renders an IP Stack section with IPv4 pre-checked if the vpcIpv6 feature flag is enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['VPC Dual Stack'],
    });

    server.use(http.get('*/account', () => HttpResponse.json(account)));

    renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
      // @TODO VPC IPv6: Remove this flag check once VPC IPv6 is in GA
      options: {
        flags: {
          vpcIpv6: true,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('IP Stack')).toBeVisible();
    });

    const NetworkingIPStackRadios = screen.getAllByRole('radio');
    expect(NetworkingIPStackRadios[0]).toBeChecked(); // IPv4
    expect(NetworkingIPStackRadios[1]).not.toBeChecked(); // Dual Stack
  });

  it('renders VPC IPv6 Prefix Length options with /52 selected if the selected region has multiple prefix lengths available', async () => {
    const account = accountFactory.build({
      capabilities: ['VPC Dual Stack', 'VPC IPv6 Large Prefixes'],
    });

    server.use(http.get('*/account', () => HttpResponse.json(account)));
    server.use(
      http.get('*/regions/vpc-availability*', () =>
        HttpResponse.json(
          makeResourcePage([
            regionVPCAvailabilityFactory.build({
              region: 'us-east',
              available_ipv6_prefix_lengths: [48, 52],
            }),
          ])
        )
      )
    );

    renderWithThemeAndHookFormContext({
      component: (
        <VPCTopSectionContent
          {...props}
          regions={[
            regionFactory.build({
              id: 'us-east',
              capabilities: ['VPCs', 'VPC Dual Stack'],
              label: 'US, Newark, NJ',
            }),
          ]}
        />
      ),
      // @TODO VPC IPv6: Remove this flag check once VPC IPv6 is in GA
      options: {
        flags: {
          vpcIpv6: true,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
        },
      },
    });

    const regionSelect = screen.getByPlaceholderText('Select a Region');

    await userEvent.click(regionSelect);
    await userEvent.type(regionSelect, 'US, Newark, NJ (us-east)');
    await waitFor(async () => {
      const selectedRegionOption = screen.getByText('US, Newark, NJ (us-east)');
      await userEvent.click(selectedRegionOption);
    });

    await waitFor(() => {
      expect(screen.getByText('IP Stack')).toBeVisible();
    });

    const NetworkingIPStackRadios = screen.getAllByRole('radio');
    await userEvent.click(NetworkingIPStackRadios[1]);
    expect(NetworkingIPStackRadios[0]).not.toBeChecked(); // IPv4
    expect(NetworkingIPStackRadios[1]).toBeChecked(); // Dual Stack

    expect(screen.getByText('VPC IPv6 Prefix Length')).toBeVisible();
    const IPv6CIDRRadios = screen.getAllByRole('radio');
    expect(IPv6CIDRRadios[2]).not.toBeChecked(); // /48
    expect(IPv6CIDRRadios[3]).toBeChecked(); // /52
  });

  it('does not render VPC IPv6 Prefix Length options if there are none available or only /52 available', async () => {
    const account = accountFactory.build({
      capabilities: ['VPC Dual Stack'],
    });

    server.use(http.get('*/account', () => HttpResponse.json(account)));
    server.use(
      http.get('*/regions/vpc-availability*', () =>
        HttpResponse.json(
          makeResourcePage([
            regionVPCAvailabilityFactory.build({
              region: 'us-east',
              available_ipv6_prefix_lengths: [52],
            }),
          ])
        )
      )
    );

    renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
      // @TODO VPC IPv6: Remove this flag check once VPC IPv6 is in GA
      options: {
        flags: {
          vpcIpv6: true,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('IP Stack')).toBeVisible();
    });

    const NetworkingIPStackRadios = screen.getAllByRole('radio');
    await userEvent.click(NetworkingIPStackRadios[1]);
    expect(NetworkingIPStackRadios[0]).not.toBeChecked(); // IPv4
    expect(NetworkingIPStackRadios[1]).toBeChecked(); // Dual Stack

    expect(
      screen.queryByText('VPC IPv6 Prefix Length')
    ).not.toBeInTheDocument();
  });
});
