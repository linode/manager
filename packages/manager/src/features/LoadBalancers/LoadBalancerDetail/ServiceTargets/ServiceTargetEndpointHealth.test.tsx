import React from 'react';

import {
  endpointHealthFactory,
  serviceTargetsEndpointHealthFactory,
} from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ServiceTargetEndpontHeath } from './ServiceTargetEndpointHealth';

describe('ServiceTargetEndpontHeath', () => {
  it('renders endpoint health from API data', async () => {
    const serviceTargetId = 1;

    server.use(
      http.get('*/v4beta/aclb/:id/service-targets/endpoints-health', () => {
        const health = serviceTargetsEndpointHealthFactory.build({
          service_targets: [
            endpointHealthFactory.build({
              healthy_endpoints: 99,
              id: serviceTargetId,
              total_endpoints: 100,
            }),
          ],
        });
        return HttpResponse.json(health);
      })
    );

    const { findByText } = renderWithTheme(
      <ServiceTargetEndpontHeath
        loadbalancerId={0}
        serviceTargetId={serviceTargetId}
      />
    );

    await findByText('99 up');

    await findByText('1 down'); // 100 - 99
  });
});
