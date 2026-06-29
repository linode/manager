import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVPC,
} from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { firewallFactory, firewallSettingsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { useComputePricing } from 'src/utilities/pricing/useComputePricing';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddInterfaceForm } from './AddInterfaceForm';

import type { PriceObject } from '@linode/api-v4';

vi.mock('src/utilities/pricing/useComputePricing', () => ({
  useComputePricing: vi.fn(() => ({
    billing: 'monthly' as const,
    formatPrice: (p: null | PriceObject | undefined) =>
      String(p?.monthly ?? '--.--'),
    getBillingForPlanType: vi.fn(() => 'monthly' as const),
    getPrice: (p: null | PriceObject | undefined) => p?.monthly ?? '--.--',
    getPriceSubheading: vi.fn(),
    hasHourlyEligiblePlans: () => false,
    priceLabel: 'month',
  })),
}));

const mockHourlyBilling = () =>
  vi.mocked(useComputePricing).mockReturnValue({
    billing: 'hourly',
    formatPrice: (p: null | PriceObject | undefined) =>
      String(p?.hourly ?? '--.--'),
    getBillingForPlanType: vi.fn(() => 'hourly' as const),
    getPrice: (p: null | PriceObject | undefined) => p?.hourly ?? '--.--',
    getPriceSubheading: vi.fn(),
    hasHourlyEligiblePlans: () => true,
    priceLabel: 'hour',
  });

const mockMonthlyBilling = () =>
  vi.mocked(useComputePricing).mockReturnValue({
    billing: 'monthly',
    formatPrice: (p: null | PriceObject | undefined) =>
      String(p?.monthly ?? '--.--'),
    getBillingForPlanType: vi.fn(() => 'monthly' as const),
    getPrice: (p: null | PriceObject | undefined) => p?.monthly ?? '--.--',
    getPriceSubheading: vi.fn(),
    hasHourlyEligiblePlans: () => false,
    priceLabel: 'month',
  });

const props = { linodeId: 0, onClose: vi.fn(), regionId: '' };

describe('AddInterfaceForm', () => {
  beforeEach(() => {
    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [],
        });
      })
    );
  });

  it('renders radios for the interface types (Public, VPC, VLAN)', async () => {
    const { getByRole, findByRole } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    // Wait for the loading to complete and form to render
    await findByRole('radio', { name: 'VPC' });

    expect(getByRole('radio', { name: 'VPC' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Public' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'VLAN' })).toBeInTheDocument();
  });

  it('renders a Firewall select if "VPC" is selected', async () => {
    const { getByRole, getByLabelText, findByRole } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    // Wait for the loading to complete and form to render
    await findByRole('radio', { name: 'VPC' });
    await userEvent.click(getByRole('radio', { name: 'VPC' }));

    expect(getByLabelText('Firewall')).toBeVisible();
  });

  it('renders a Firewall select if "Public" is selected', async () => {
    const { getByRole, getByLabelText, findByRole } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    // Wait for the loading to complete and form to render
    await findByRole('radio', { name: 'Public' });
    await userEvent.click(getByRole('radio', { name: 'Public' }));

    expect(getByLabelText('Firewall')).toBeVisible();
  });

  it('renders does not render a Firewall select if "VLAN" is selected', async () => {
    const { getByRole, queryByLabelText, findByRole } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    // Wait for the loading to complete and form to render
    await findByRole('radio', { name: 'VLAN' });
    await userEvent.click(getByRole('radio', { name: 'VLAN' }));

    expect(queryByLabelText('Firewall')).toBeNull();
  });

  it('pre-selects the default Firewall for a VPC interface', async () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        vpc_interface: 5,
      },
    });

    const firewall = firewallFactory.build({ id: 5 });

    server.use(
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettings);
      }),
      http.get('*/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewall]));
      })
    );

    const { getByRole, findByDisplayValue, findByRole } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    // Wait for the loading to complete and form to render
    await findByRole('radio', { name: 'VPC' });
    await userEvent.click(getByRole('radio', { name: 'VPC' }));

    await findByDisplayValue(firewall.label);
  });

  it('keeps selected Firewall when toggling VPC to VLAN and back to VPC', async () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        vpc_interface: 5,
      },
    });

    const firewall = firewallFactory.build({ id: 5 });

    server.use(
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettings);
      }),
      http.get('*/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewall]));
      })
    );

    const { getByRole, findByDisplayValue, findByRole } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    await findByRole('radio', { name: 'VPC' });

    await userEvent.click(getByRole('radio', { name: 'VPC' }));
    await findByDisplayValue(firewall.label);

    await userEvent.click(getByRole('radio', { name: 'VLAN' }));
    await userEvent.click(getByRole('radio', { name: 'VPC' }));

    await findByDisplayValue(firewall.label);
  });

  it('does not auto-select "No firewall" when toggling VLAN to VPC without a default firewall', async () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {},
    });

    server.use(
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettings);
      }),
      http.get('*/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByRole, findByRole, queryByText } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    await findByRole('radio', { name: 'VPC' });

    await userEvent.click(getByRole('radio', { name: 'VLAN' }));
    await userEvent.click(getByRole('radio', { name: 'VPC' }));

    expect(
      queryByText(
        /This Linode, or its Linode interface, is not secured with a Cloud Firewall/i
      )
    ).toBeNull();
  });

  it('does not carry VPC firewall to Public when Public has no saved/default firewall', async () => {
    const firewallSettings = firewallSettingsFactory.build({
      default_firewall_ids: {
        vpc_interface: 5,
      },
    });

    const firewall = firewallFactory.build({ id: 5 });

    server.use(
      http.get('*/networking/firewalls/settings', () => {
        return HttpResponse.json(firewallSettings);
      }),
      http.get('*/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewall]));
      })
    );

    const { getByRole, findByRole, findByDisplayValue, queryByDisplayValue } =
      renderWithTheme(<AddInterfaceForm {...props} />);

    await findByRole('radio', { name: 'VPC' });

    await userEvent.click(getByRole('radio', { name: 'VPC' }));
    await findByDisplayValue(firewall.label);

    await userEvent.click(getByRole('radio', { name: 'Public' }));

    expect(queryByDisplayValue(firewall.label)).toBeNull();
  });

  it('should show a warning notice on selection of VPC option if a Public interface already exists', async () => {
    const mockPublicInterface = linodeInterfaceFactoryPublic.build();

    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [mockPublicInterface],
        });
      })
    );

    const { getByRole, findByRole, getByText } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    // Wait for the loading to complete and form to render
    await findByRole('radio', { name: 'VPC' });
    await userEvent.click(getByRole('radio', { name: 'VPC' }));
    expect(
      getByText(/This Linode already has a public interface/)
    ).toBeVisible();
  });

  it('should show a warning notice on selection of Public option if a VPC interface already exists', async () => {
    const mockVPCInterface = linodeInterfaceFactoryVPC.build();

    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [mockVPCInterface],
        });
      })
    );

    const { getByRole, findByRole, getByText } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    // Wait for the loading to complete and form to render
    await findByRole('radio', { name: 'Public' });
    await userEvent.click(getByRole('radio', { name: 'Public' }));
    expect(getByText(/This Linode already has a VPC interface/)).toBeVisible();
  });

  it('should disable Public interface radio button if a Public interface already exists', async () => {
    const mockPublicInterface = linodeInterfaceFactoryPublic.build();

    server.use(
      http.get('*/linode/instances/:linodeId/interfaces', () => {
        return HttpResponse.json({
          interfaces: [mockPublicInterface],
        });
      })
    );

    const { getByRole, findByRole } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    // Wait for the loading to complete and form to render
    await findByRole('radio', { name: 'Public' });

    expect(getByRole('radio', { name: 'Public' })).toBeDisabled();
  });

  // The warning appears in two situations:
  //   1. VPC exists -> user selects Public
  //   2. Public exists -> user selects VPC
  it.each([
    {
      existingFactory: linodeInterfaceFactoryVPC,
      radioToClick: 'Public',
      billing: 'monthly' as const,
      expectedCopy: /will incur an additional monthly charge/i,
    },
    {
      existingFactory: linodeInterfaceFactoryVPC,
      radioToClick: 'Public',
      billing: 'hourly' as const,
      expectedCopy: /will incur an additional hourly charge/i,
    },
    {
      existingFactory: linodeInterfaceFactoryPublic,
      radioToClick: 'VPC',
      billing: 'monthly' as const,
      expectedCopy: /will incur an additional monthly charge/i,
    },
    {
      existingFactory: linodeInterfaceFactoryPublic,
      radioToClick: 'VPC',
      billing: 'hourly' as const,
      expectedCopy: /will incur an additional hourly charge/i,
    },
  ])(
    'shows "$billing charge" in warning when $radioToClick is selected ($billing billing)',
    async ({ existingFactory, radioToClick, billing, expectedCopy }) => {
      if (billing === 'hourly') {
        mockHourlyBilling();
      } else {
        mockMonthlyBilling();
      }

      server.use(
        http.get('*/linode/instances/:linodeId/interfaces', () => {
          return HttpResponse.json({ interfaces: [existingFactory.build()] });
        })
      );

      const { getByRole, findByRole, getByText } = renderWithTheme(
        <AddInterfaceForm {...props} />
      );

      await findByRole('radio', { name: radioToClick });
      await userEvent.click(getByRole('radio', { name: radioToClick }));

      expect(getByText(expectedCopy)).toBeVisible();
    }
  );
});
