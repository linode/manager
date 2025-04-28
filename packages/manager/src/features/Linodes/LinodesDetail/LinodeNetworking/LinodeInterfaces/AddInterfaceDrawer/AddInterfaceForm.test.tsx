import userEvent from '@testing-library/user-event';
import React from 'react';

import { firewallFactory, firewallSettingsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddInterfaceForm } from './AddInterfaceForm';

const props = { linodeId: 0, onClose: vi.fn(), regionId: '' };

describe('AddInterfaceForm', () => {
  it('renders radios for the interface types (Public, VPC, VLAN)', () => {
    const { getByRole } = renderWithTheme(<AddInterfaceForm {...props} />);

    expect(getByRole('radio', { name: 'VPC' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Public' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'VLAN' })).toBeInTheDocument();
  });

  it('renders a Firewall select if "VPC" is selected', async () => {
    const { getByRole, getByLabelText } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    await userEvent.click(getByRole('radio', { name: 'VPC' }));

    expect(getByLabelText('Firewall')).toBeVisible();
  });

  it('renders a Firewall select if "Public" is selected', async () => {
    const { getByRole, getByLabelText } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    await userEvent.click(getByRole('radio', { name: 'Public' }));

    expect(getByLabelText('Firewall')).toBeVisible();
  });

  it('renders does not render a Firewall select if "VLAN" is selected', async () => {
    const { getByRole, queryByLabelText } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

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

    const { getByRole, findByDisplayValue } = renderWithTheme(
      <AddInterfaceForm {...props} />
    );

    await userEvent.click(getByRole('radio', { name: 'VPC' }));

    await findByDisplayValue(firewall.label);
  });
});
