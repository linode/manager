import {
  grantsFactory,
  nodeBalancerFactory,
  profileFactory,
} from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithRouter } from 'src/utilities/testHelpers';

import { NodeBalancerSettings } from './NodeBalancerSettings';

const connectionThrottle = 'Connection Throttle';

describe('NodeBalancerSettings', () => {
  it('renders the NodeBalancerSettings component', async () => {
    const firewall = firewallFactory.build({ label: 'mock-firewall-1' });
    const nodebalancer = nodeBalancerFactory.build();

    server.use(
      http.get('*/v4/nodebalancers/:id', () => {
        return HttpResponse.json(nodebalancer);
      }),
      http.get('*/v4/nodebalancers/:id/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewall]));
      })
    );

    const {
      getAllByText,
      getByLabelText,
      getByTestId,
      getByText,
      findByDisplayValue,
    } = renderWithTheme(
      wrapWithRouter(<NodeBalancerSettings />, {
        initialRoute: '/nodebalancers/$id/settings',
      })
    );

    await findByDisplayValue(nodebalancer.label);

    // NodeBalancer Label panel
    expect(getByText('NodeBalancer Label')).toBeVisible();
    expect(getByText('Label')).toBeVisible();
    expect(getByLabelText('Label')).not.toBeDisabled();

    // Firewall panel
    expect(getByText('Firewalls')).toBeVisible();
    expect(getByText('Status')).toBeVisible();
    expect(getByText('Rules')).toBeVisible();
    expect(getByText('mock-firewall-1')).toBeVisible();
    expect(getByText('Enabled')).toBeVisible();
    expect(getByText('1 Inbound / 1 Outbound')).toBeVisible();
    expect(getByText('Unassign')).toBeVisible();

    // Client Connection Throttle panel
    expect(getByText('Client Connection Throttle')).toBeVisible();
    expect(getByText(connectionThrottle)).toBeVisible();
    expect(getByLabelText(connectionThrottle)).not.toBeDisabled();
    expect(
      getByText(
        'To help mitigate abuse, throttle connections from a single client IP to this number per second. 0 to disable.'
      )
    ).toBeVisible();
    expect(getAllByText('Save')).toHaveLength(2);

    // Delete panel
    expect(getByText('Delete NodeBalancer')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
    expect(getByTestId('delete-nodebalancer')).not.toBeDisabled();
  });

  it('disables inputs and buttons if the NodeBalancer is read only', async () => {
    const nodebalancer = nodeBalancerFactory.build();
    const profile = profileFactory.build({ restricted: true });
    const grants = grantsFactory.build({
      nodebalancer: [
        {
          id: nodebalancer.id,
          label: nodebalancer.label,
          permissions: 'read_only',
        },
      ],
    });

    server.use(
      http.get('*/v4/nodebalancers/:id', () => {
        return HttpResponse.json(nodebalancer);
      }),
      http.get('*/v4/profile', () => {
        return HttpResponse.json(profile);
      }),
      http.get('*/v4/profile/grants', () => {
        return HttpResponse.json(grants);
      })
    );

    const { getByLabelText, getByTestId } = renderWithTheme(
      wrapWithRouter(<NodeBalancerSettings />, {
        initialRoute: '/nodebalancers/$id/settings',
      })
    );

    await waitFor(() => {
      expect(getByLabelText('Label')).toBeDisabled();
      expect(getByLabelText(connectionThrottle)).toBeDisabled();
      expect(getByTestId('delete-nodebalancer')).toBeDisabled();
    });
  });
});
