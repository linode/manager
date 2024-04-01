import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeFirewalls } from './LinodeFirewalls';

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
});
