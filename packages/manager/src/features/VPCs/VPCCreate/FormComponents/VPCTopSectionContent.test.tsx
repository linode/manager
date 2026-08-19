import { regionFactory, regionVPCAvailabilityFactory } from '@linode/utilities';
import { fireEvent, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { accountFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import * as VPCUtils from '../../utils';
import { VPCTopSectionContent } from './VPCTopSectionContent';

/**
 * <cds-radio-button> exposes `checked` as an element property (set by the
 * @lit/react wrapper).
 */
const getCdsRadioChecked = (element: Element): boolean =>
  (element as Element & { checked: boolean }).checked;

const props = {
  regions: [],
};

describe('VPC Top Section form content', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    // <cds-radio-button> exposes `checked` as an element property (set by the
    // @lit/react wrapper), so assert on that rather than a native input role.
    expect(getCdsRadioChecked(screen.getByTestId('ip-stack-ipv4-radio'))).toBe(
      true
    ); // IPv4
  });

  it('renders VPC IPv6 Prefix Length options with /52 selected if the selected region has multiple prefix lengths available', async () => {
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

    // Select the dual stack option. <cds-radio-button> emits a `change`
    // CustomEvent with `detail.value`; dispatch it directly since role-based
    // interactions don't apply to the web component.
    fireEvent(
      screen.getByTestId('ip-stack-dual-stack-radio'),
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value: 'dual-stack' },
      })
    );

    expect(getCdsRadioChecked(screen.getByTestId('ip-stack-ipv4-radio'))).toBe(
      false
    ); // IPv4
    expect(
      getCdsRadioChecked(screen.getByTestId('ip-stack-dual-stack-radio'))
    ).toBe(true); // Dual Stack

    await waitFor(() => {
      expect(screen.getByText('VPC IPv6 Prefix Length')).toBeVisible();
    });

    expect(
      getCdsRadioChecked(screen.getByTestId('vpc-ipv6-prefix-length-48-radio'))
    ).toBe(false); // /48
    expect(
      getCdsRadioChecked(screen.getByTestId('vpc-ipv6-prefix-length-52-radio'))
    ).toBe(true); // /52
  });

  it('does not show dual stack option and does not render VPC IPv6 Prefix Length options if there are none available', async () => {
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
              available_ipv6_prefix_lengths: [],
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

    expect(screen.getByText('IPv4')).toBeVisible(); // IPv4
    expect(
      screen.queryByText('IPv4 + IPv6 (Dual Stack)')
    ).not.toBeInTheDocument(); // Dual Stack

    expect(
      screen.queryByText('VPC IPv6 Prefix Length')
    ).not.toBeInTheDocument();
  });

  it('hides IPv6 options in IP Stack when VPC type is RDMA', async () => {
    const account = accountFactory.build({
      capabilities: ['GPUDirect RDMA', 'VPC Dual Stack'],
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
      options: {
        flags: {
          nitro: { enabled: true },
          vpcIpv6: true,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
          vpc_type: 'regular',
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
      expect(screen.getByText('VPC Type')).toBeVisible();
    });

    expect(screen.getByText('IPv4 + IPv6 (Dual Stack)')).toBeVisible();

    fireEvent(
      screen.getByTestId('vpc-type-rdma-radio'),
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: { value: 'rdma' },
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByText('IPv4 + IPv6 (Dual Stack)')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('VPC IPv6 Prefix Length')
      ).not.toBeInTheDocument();
    });
  });

  it('shows VPC IPv4 Range with one empty input and add button when custom ranges feature is enabled', async () => {
    vi.spyOn(VPCUtils, 'useIsCustomVPCIPv4RangesEnabled').mockReturnValue({
      isCustomVPCIPv4RangesEnabled: true,
    });

    const account = accountFactory.build({
      capabilities: ['Custom VPC IPv4 Ranges'],
    });

    server.use(http.get('*/account', () => HttpResponse.json(account)));

    renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
      options: {
        flags: {
          nitro: { enabled: true },
          vpcIpv6: false,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
          ipv4: [],
        },
      },
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add IPv4 Range' })
      ).toBeVisible();
      expect(
        screen.queryByLabelText('VPC IPv4 Range (CIDR)', { exact: false })
      ).toBeVisible();
    });
  });

  it('hides VPC IPv4 Range when custom ranges feature is disabled', async () => {
    vi.spyOn(VPCUtils, 'useIsCustomVPCIPv4RangesEnabled').mockReturnValue({
      isCustomVPCIPv4RangesEnabled: false,
    });

    const account = accountFactory.build({
      capabilities: ['Custom VPC IPv4 Ranges'],
    });

    server.use(http.get('*/account', () => HttpResponse.json(account)));

    renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
      options: {
        flags: {
          nitro: { enabled: false },
          vpcIpv6: false,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
          ipv4: [],
        },
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Add IPv4 Range' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('VPC IPv4 Range ip-address-0')
      ).not.toBeInTheDocument();
    });
  });
});
