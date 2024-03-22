import React from 'react';

import { loadbalancerEndpointHealthFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LoadBalancerEndpointHealth } from './LoadBalancerEndpointHealth';

describe('LoadBalancerEndpointHealth', () => {
  it('renders endpoint health from API data', async () => {
    server.use(
      http.get('*/v4beta/aclb/:id/endpoints-health', () => {
        const health = loadbalancerEndpointHealthFactory.build({
          healthy_endpoints: 150,
          total_endpoints: 200,
        });
        return HttpResponse.json(health);
      })
    );

    const { findByText } = renderWithTheme(
      <LoadBalancerEndpointHealth id={0} />
    );

    await findByText('150 up');

    await findByText('50 down'); // 200 - 150
  });
});
