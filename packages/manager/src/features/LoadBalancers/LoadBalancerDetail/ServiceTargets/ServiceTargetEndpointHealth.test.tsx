import React from 'react';

import {
  endpointHealthFactory,
  serviceTargetsEndpointHealthFactory,
} from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ServiceTargetEndpontHeath } from './ServiceTargetEndpointHealth';

describe('ServiceTargetEndpontHeath', () => {
  it('renders endpoint health from API data', async () => {
    const serviceTargetId = 1;

    server.use(
      rest.get(
        '*/v4beta/aglb/:id/service-targets/endpoints-health',
        (req, res, ctx) => {
          const health = serviceTargetsEndpointHealthFactory.build({
            service_targets: [
              endpointHealthFactory.build({
                healthy_endpoints: 99,
                id: serviceTargetId,
                total_endpoints: 100,
              }),
            ],
          });
          return res(ctx.json(health));
        }
      )
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
