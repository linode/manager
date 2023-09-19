import React from 'react';

import { linodeTypeFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SelectRegionPanel } from './SelectRegionPanel';

describe('SelectRegionPanel', () => {
  it('should render a notice when the selected region has unique pricing and the flag is on', async () => {
    server.use(
      rest.get('*/linode/types', (req, res, ctx) => {
        const types = linodeTypeFactory.buildList(1, {
          region_prices: [
            {
              hourly: 2,
              id: 'id-cgk',
              monthly: 2,
            },
          ],
        });
        return res(ctx.json(makeResourcePage(types)));
      })
    );

    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: () => ({
        pathname: '/linodes/create',
      }),
    }));

    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });

    const { findByText } = renderWithTheme(
      <SelectRegionPanel
        handleSelection={jest.fn()}
        regions={regions}
        selectedID="id-cgk"
      />,
      { flags: { dcSpecificPricing: true } }
    );

    await findByText(
      `Prices for plans, products, and services in ${regions[0].label} may vary from other regions.`,
      { exact: false }
    );
  });
});
