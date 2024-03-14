import React from 'react';

import { configurationFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Ports } from './Ports';

describe('Ports', () => {
  it('renders the port of each config', async () => {
    const configs = [
      configurationFactory.build({ port: 80 }),
      configurationFactory.build({ port: 8080 }),
      configurationFactory.build({ port: 443 }),
      configurationFactory.build({ port: 22 }),
    ];

    server.use(
      http.get('*/aclb/1/configurations*', () => {
        return HttpResponse.json(makeResourcePage(configs));
      })
    );

    const { findByText } = renderWithTheme(<Ports loadbalancerId={1} />);

    for (const config of configs) {
      // eslint-disable-next-line no-await-in-loop
      await findByText(config.port, { exact: false });
    }
  });
});
