import userEvent from '@testing-library/user-event';
import React from 'react';

import { firewallFactory, firewallSettingsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { LinodeInterface } from './LinodeInterface';

import type { LinodeCreateFormValues } from '../utilities';

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: vi.fn(() => ({
    data: { delete_firewall: true, update_firewall: true },
  })),
}));

vi.mock('src/features/ReservedIps/utils', () => ({
  getReservedIPHourlyPrice: vi.fn(() => 0.007),
  useIsReserveIpEnabled: vi.fn(() => ({ isReserveIpEnabled: true })),
  useIsReserveIpNewBadgeEnabled: vi.fn(() => ({
    isReserveIpNewBadgeEnabled: false,
  })),
}));

describe('LinodeInterface (Linode Interfaces)', () => {
  it('renders radios for the interface types (Public, VPC, VLAN)', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <LinodeInterface index={0} />,
    });

    expect(getByText('Public Internet')).toBeVisible();
    expect(getByText('VPC')).toBeVisible();
    expect(getByText('VLAN')).toBeVisible();
  });

  it('renders radios for the interfaces (Linode interface, Config profile)', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <LinodeInterface index={0} />,
    });

    expect(getByText(/Linode Interfaces/)).toBeVisible();
    expect(getByText(/Configuration Profile Interfaces/)).toBeVisible();
  });

  it('renders a Firewall select if "VPC" is selected', async () => {
    const { getByText, getByLabelText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('VPC'));

    expect(getByLabelText('VPC Interface Firewall')).toBeVisible();
  });

  it('renders a Firewall select if "Public" is selected', async () => {
    const { getByText, getByLabelText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('Public Internet'));

    expect(getByLabelText('Public Interface Firewall')).toBeVisible();
  });

  it('renders does not render a Firewall select if "VLAN" is selected', async () => {
    const { getByText, queryByLabelText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('VLAN'));

    expect(queryByLabelText('Firewall', { exact: false })).toBeNull();
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

    const { getByText, findByDisplayValue } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('VPC'));

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

    const { getByText, findByDisplayValue } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('VPC'));
    await findByDisplayValue(firewall.label);

    await userEvent.click(getByText('VLAN'));
    await userEvent.click(getByText('VPC'));

    await findByDisplayValue(firewall.label);
  });

  it('renders IP Address selection if "Public Internet" is selected for new Linode interface', async () => {
    const { getByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('Public Internet'));

    expect(getByText('IP Address')).toBeVisible();
  });

  it('renders IP Address selection if "Public Internet" is selected for legacy Linode interface', async () => {
    const { getByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: {
          defaultValues: { interface_generation: 'legacy_config' },
        },
      });

    await userEvent.click(getByText('Public Internet'));

    expect(getByText('IP Address')).toBeVisible();
  });

  it('does not render IP Address selection if "VPC" is selected', async () => {
    const { getByText, queryByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('VPC'));

    expect(queryByText('IP Address')).toBeNull();
  });

  it('does not render IP Address selection if "VLAN" is selected', async () => {
    const { getByText, queryByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('VLAN'));

    expect(queryByText('IP Address')).toBeNull();
  });

  it('does not render IP Address selection when reserveIp feature flag is disabled', async () => {
    const { useIsReserveIpEnabled } = await import(
      'src/features/ReservedIps/utils'
    );
    vi.mocked(useIsReserveIpEnabled).mockReturnValue({
      isReserveIpEnabled: false,
    });

    const { getByText, queryByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <LinodeInterface index={0} />,
        useFormOptions: { defaultValues: { interface_generation: 'linode' } },
      });

    await userEvent.click(getByText('Public Internet'));

    expect(queryByText('IP Address')).toBeNull();

    // Restore default mock for subsequent tests
    vi.mocked(useIsReserveIpEnabled).mockReturnValue({
      isReserveIpEnabled: true,
    });
  });
});
