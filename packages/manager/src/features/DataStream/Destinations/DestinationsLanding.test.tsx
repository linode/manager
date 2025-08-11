import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { destinationFactory } from 'src/factories/datastream';
import { DestinationsLanding } from 'src/features/DataStream/Destinations/DestinationsLanding';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';

describe('Destinations Landing Table', () => {
  it('should render destinations landing table with items PaginationFooter', async () => {
    server.use(
      http.get('*/monitor/streams/destinations', () => {
        return HttpResponse.json(
          makeResourcePage(destinationFactory.buildList(30))
        );
      })
    );

    const { getByText, queryByTestId, getByTestId } = renderWithTheme(
      <DestinationsLanding />
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    // Table column headers
    getByText('Name');
    getByText('Type');
    getByText('ID');
    getByText('Last Modified');

    // PaginationFooter
    const paginationFooterSelectPageSizeInput = getByTestId(
      'textfield-input'
    ) as HTMLInputElement;
    expect(paginationFooterSelectPageSizeInput.value).toBe('Show 25');
  });

  it('should render images landing empty state', async () => {
    server.use(
      http.get('*/monitor/streams/destinations', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(
      <DestinationsLanding />
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    getByText((text) => text.includes('Create a destination for cloud logs'));
  });
});
