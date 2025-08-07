import { waitFor } from '@testing-library/react';
import React from 'react';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Firewall } from './Firewall';

import type { CreateLinodeRequest } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
      create_firewall: false,
    },
  })),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('Linode Create Firewall', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('should render a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Firewall />,
    });

    const heading = getByText('Firewall');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should disable a Firewall select if the user does not have create_linode permission', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Firewall />,
    });

    const firewallSelect = getByLabelText('Assign Firewall');

    expect(firewallSelect).toBeVisible();
    expect(firewallSelect).toBeDisabled();
  });

  it('should disable a "Create Firewall" button if the user does not have create_firewall permission', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Firewall />,
    });

    const createFirewallButton = getByText('Create Firewall');

    expect(createFirewallButton).toBeVisible();
    expect(createFirewallButton).toBeDisabled();
  });

  it('should enable a Firewall select if the user has create_linode permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
        create_firewall: true,
      },
    });
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Firewall />,
    });

    const firewallSelect = getByLabelText('Assign Firewall');

    expect(firewallSelect).toBeVisible();
    expect(firewallSelect).toBeEnabled();
  });

  it('should enable a "Create Firewall" button if the user has create_firewall permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
        create_firewall: true,
      },
    });
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Firewall />,
    });

    const createFirewallButton = getByText('Create Firewall');

    expect(createFirewallButton).toBeVisible();
    expect(createFirewallButton).toBeEnabled();
  });

  it('should populate the select based on form data and the firewall API response', async () => {
    const firewall = firewallFactory.build();

    server.use(
      http.get('*/v4/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewall]));
      })
    );

    const { getByLabelText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <Firewall />,
        useFormOptions: { defaultValues: { firewall_id: firewall.id } },
      });

    await waitFor(
      () => {
        expect(getByLabelText('Assign Firewall')).toHaveDisplayValue(
          firewall.label
        );
      },
      { timeout: 5_000 }
    );
  });
});
