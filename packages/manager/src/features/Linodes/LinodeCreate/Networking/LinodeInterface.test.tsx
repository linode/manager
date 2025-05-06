import userEvent from '@testing-library/user-event';
import React from 'react';

import { firewallFactory, firewallSettingsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { LinodeInterface } from './LinodeInterface';

import type { LinodeCreateFormValues } from '../utilities';

describe('LinodeInterface (Linode Interfaces)', () => {
  it('renders radios for the interface types (Public, VPC, VLAN)', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <LinodeInterface index={0} />,
    });

    expect(getByText('Public Internet')).toBeInTheDocument();
    expect(getByText('VPC')).toBeInTheDocument();
    expect(getByText('VLAN')).toBeInTheDocument();
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
});
