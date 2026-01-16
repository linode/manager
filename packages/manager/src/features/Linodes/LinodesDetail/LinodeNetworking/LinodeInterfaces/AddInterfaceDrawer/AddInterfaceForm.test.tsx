import { linodeInterfaceFactoryPublic } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { firewallFactory, firewallSettingsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddInterfaceForm } from './AddInterfaceForm';

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
});
