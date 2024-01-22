import React from 'react';

import {
  configurationFactory,
  configurationsEndpointHealthFactory,
  endpointHealthFactory,
} from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ConfigurationAccordionHeader } from './ConfigurationAccordionHeader';

describe('ConfigurationAccordionHeader', () => {
  it('renders configuration information', () => {
    const configuration = configurationFactory.build({ routes: [] });

    const { getByText } = renderWithTheme(
      <ConfigurationAccordionHeader
        configuration={configuration}
        loadbalancerId={0}
      />
    );

    // Label
    expect(getByText(configuration.label)).toBeVisible();

    // ID
    expect(getByText(`ID: ${configuration.id}`)).toBeVisible();

    // Port
    expect(
      getByText(`Port ${configuration.port}`, { exact: false })
    ).toBeVisible();

    // Number of Routes
    expect(getByText('0 Routes', { exact: false })).toBeVisible();
  });

  it('renders endpoint health for a configuration', async () => {
    const configuration = configurationFactory.build({ routes: [] });

    const configurationHealth = endpointHealthFactory.build({
      healthy_endpoints: 5,
      id: configuration.id,
      total_endpoints: 9,
    });

    const allConfigurationsEndpointHealth = configurationsEndpointHealthFactory.build(
      {
        configurations: [configurationHealth],
        id: 5,
      }
    );

    server.use(
      rest.get(
        '*/v4beta/aglb/5/configurations/endpoints-health',
        (req, res, ctx) => res(ctx.json(allConfigurationsEndpointHealth))
      )
    );

    const { findByText } = renderWithTheme(
      <ConfigurationAccordionHeader
        configuration={configuration}
        loadbalancerId={5}
      />
    );

    await findByText('5 up');

    await findByText('4 down'); // 9 - 5
  });
});
