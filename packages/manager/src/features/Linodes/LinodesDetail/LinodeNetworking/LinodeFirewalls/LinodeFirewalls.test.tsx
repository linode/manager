import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import * as React from 'react';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeFirewalls } from './LinodeFirewalls';

const navigate = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      apply_linode_firewalls: false,
      update_linode: false,
    },
  })),
  useNavigate: vi.fn(() => navigate),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
beforeAll(() => mockMatchMedia());
describe('LinodeFirewalls', () => {
  it('should render', () => {
    const wrapper = renderWithTheme(<LinodeFirewalls linodeID={1} />);

    // Verify table heading is visible
    expect(wrapper.getByTestId('linode-firewalls-table-header')).toBeVisible();
  });

  it('should have an empty row if the linode is not assigned to a firewall', async () => {
    server.use(
      http.get('*/linode/instances/1/firewalls', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const wrapper = renderWithTheme(<LinodeFirewalls linodeID={1} />);

    await waitFor(() => expect(wrapper.queryByTestId('table-row-empty')));
  });

  it('should have a firewall listed if the linode is assigned to one', async () => {
    server.use(
      http.get('*/linode/instances/1/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewallFactory.build()]));
      })
    );

    const wrapper = renderWithTheme(<LinodeFirewalls linodeID={1} />);

    expect(wrapper.queryByTestId('data-qa-linode-firewall-row'));
  });

  it("should enable 'Add Firewall' button if the user has apply_linode_firewalls permission", async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        ...queryMocks.userPermissions().data,
        apply_linode_firewalls: true,
      },
    });

    const { getByText } = renderWithTheme(<LinodeFirewalls linodeID={1} />);
    const addFirewallBtn = getByText('Add Firewall');
    expect(addFirewallBtn).toBeInTheDocument();
    expect(addFirewallBtn).toBeEnabled();
  });

  it("should disable 'Add Firewall' button if the user doesn't have apply_linode_firewalls permission", async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        ...queryMocks.userPermissions().data,
        apply_linode_firewalls: false,
      },
    });

    const { getByText } = renderWithTheme(<LinodeFirewalls linodeID={1} />);
    const addFirewallBtn = getByText('Add Firewall');
    expect(addFirewallBtn).toBeInTheDocument();
    expect(addFirewallBtn).toBeDisabled();
  });

  it("should enable 'Unassign' button if the user has update_linode permission", async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        ...queryMocks.userPermissions().data,
        update_linode: true,
      },
    });

    server.use(
      http.get('*/linode/instances/1/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewallFactory.build()]));
      })
    );

    const { getByText } = renderWithTheme(<LinodeFirewalls linodeID={1} />);

    const loadingTestId = 'table-row-loading';
    await waitForElementToBeRemoved(() => screen.queryByTestId(loadingTestId));

    const unassignFirewallBtn = getByText('Unassign');
    expect(unassignFirewallBtn).toBeInTheDocument();
    expect(unassignFirewallBtn).toBeEnabled();
  });

  it("should disable 'Unassign' button if the user doesn't have update_linode permission", async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        ...queryMocks.userPermissions().data,
        update_linode: false,
      },
    });

    server.use(
      http.get('*/linode/instances/1/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewallFactory.build()]));
      })
    );

    const { getByText } = renderWithTheme(<LinodeFirewalls linodeID={1} />);

    const loadingTestId = 'table-row-loading';
    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    const unassignFirewallBtn = getByText('Unassign');
    expect(unassignFirewallBtn).toBeInTheDocument();
    expect(unassignFirewallBtn).toBeDisabled();
  });
});
