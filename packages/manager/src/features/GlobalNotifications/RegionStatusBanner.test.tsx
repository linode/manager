import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { regionFactory } from 'src/factories/regions';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RegionStatusBanner } from './RegionStatusBanner';

describe('Region status banner', () => {
  it('should render null if there are no warnings', () => {
    server.use(
      http.get('*/regions', () => {
        const regions = regionFactory.buildList(5);
        return HttpResponse.json(makeResourcePage(regions));
      })
    );
    const { container } = renderWithTheme(<RegionStatusBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render the region's name, and not a list, for a single affected region", async () => {
    server.use(
      http.get('*/regions', () => {
        const regions = regionFactory.buildList(1, {
          id: 'us-east',
          label: 'Newark, NJ',
          status: 'outage',
        });
        return HttpResponse.json(makeResourcePage(regions));
      })
    );
    const { queryAllByTestId, queryAllByText } = renderWithTheme(
      <RegionStatusBanner />
    );
    await waitFor(() => {
      expect(queryAllByText(/Newark, NJ/i)).toHaveLength(1);
      expect(queryAllByTestId(/facility-outage/)).toHaveLength(0);
    });
  });

  it("should render a list with each region with a status of 'outage' when there are more than one such region", async () => {
    server.use(
      http.get('*/regions', () => {
        const regions = regionFactory.buildList(5, {
          status: 'outage',
        });
        return HttpResponse.json(makeResourcePage(regions));
      })
    );
    const { queryAllByTestId } = renderWithTheme(<RegionStatusBanner />);

    await waitFor(() => {
      expect(queryAllByTestId(/facility-outage/)).toHaveLength(5);
    });
  });

  it('should filter out regions with no issues', async () => {
    server.use(
      http.get('*/regions', () => {
        const badRegions = regionFactory.buildList(3, { status: 'outage' });
        const goodRegions = regionFactory.buildList(2, { status: 'ok' });
        const regions = [...badRegions, ...goodRegions];
        return HttpResponse.json(makeResourcePage(regions));
      })
    );
    const { queryAllByTestId } = renderWithTheme(<RegionStatusBanner />);

    await waitFor(() => {
      expect(queryAllByTestId(/facility-outage/)).toHaveLength(3);
    });
  });
});
