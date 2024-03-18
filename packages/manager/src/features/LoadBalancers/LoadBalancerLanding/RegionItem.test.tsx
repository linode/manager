import React from 'react';

import { regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RegionItem } from './RegionItem';

describe('RegionItem', () => {
  it('renders the regions label from API data', async () => {
    const region = regionFactory.build();

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText } = renderWithTheme(<RegionItem regionId={region.id} />);

    await findByText(`${region.label} (${region.id})`);
  });
  it('renders the region id when there is no API region data', async () => {
    const region = regionFactory.build();

    const { getByText } = renderWithTheme(<RegionItem regionId={region.id} />);

    expect(getByText(region.id)).toBeVisible();
  });
});
