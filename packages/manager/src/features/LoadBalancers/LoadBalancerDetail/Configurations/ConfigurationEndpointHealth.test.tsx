import React from 'react';

import {
  configurationsEndpointHealthFactory,
  endpointHealthFactory,
} from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ConfigurationEndpointHealth } from './ConfigurationEndpointHealth';

describe('ConfigurationEndpointHealth', () => {
  it('renders endpoint health from API data', async () => {
    server.use(
      rest.get(
        '*/v4beta/aglb/:id/configurations/endpoints-health',
        (req, res, ctx) => {
          const health = configurationsEndpointHealthFactory.build({
            configurations: [
              endpointHealthFactory.build({
                healthy_endpoints: 10,
                id: 0,
                total_endpoints: 20,
              }),
            ],
          });
          return res(ctx.json(health));
        }
      )
    );

    const { findByText } = renderWithTheme(
      <ConfigurationEndpointHealth configurationId={0} loadBalancerId={0} />
    );

    await findByText('10 up'); // 20 - 10 = 10

    await findByText('10 down'); // 20 - 10 = 10
  });
});
