import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from '@tanstack/react-query';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeFirewalls } from './LinodeFirewalls';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('LinodeFirewalls', () => {
  it('should render', () => {
    const wrapper = renderWithTheme(<LinodeFirewalls linodeID={1} />, {
      queryClient,
    });

    // Verify table heading is visible
    expect(wrapper.getByTestId('linode-firewalls-table-header')).toBeVisible();
  });

  it('should have an empty row if the linode is not assigned to a firewall', async () => {
    server.use(
      rest.get('*/linode/instances/1/firewalls', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const wrapper = renderWithTheme(<LinodeFirewalls linodeID={1} />, {
      queryClient,
    });

    await waitFor(() => expect(wrapper.queryByTestId('table-row-empty')));
  });

  it('should have a firewall listed if the linode is assigned to one', async () => {
    server.use(
      rest.get('*/linode/instances/1/firewalls', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([firewallFactory.build()])));
      })
    );

    const wrapper = renderWithTheme(<LinodeFirewalls linodeID={1} />, {
      queryClient,
    });

    expect(wrapper.queryByTestId('data-qa-linode-firewall-row'));
  });
});
