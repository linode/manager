import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { destinationFactory } from 'src/factories/datastream';
import { DestinationsLanding } from 'src/features/DataStream/Destinations/DestinationsLanding';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';

describe('Destinations Landing Table', () => {
  it('should render destinations landing tab header and table with items PaginationFooter', async () => {
    server.use(
      http.get('*/monitor/streams/destinations', () => {
        return HttpResponse.json(
          makeResourcePage(destinationFactory.buildList(30))
        );
      })
    );

    const { getByText, queryByTestId, getAllByTestId, getByPlaceholderText } =
      renderWithTheme(<DestinationsLanding />, {
        initialRoute: '/datastream/destinations',
      });

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    // search text input
    getByPlaceholderText('Search for a Destination');

    // button
    getByText('Create Destination');

    // Table column headers
    getByText('Name');
    getByText('Type');
    getByText('ID');
    getByText('Last Modified');

    // PaginationFooter
    const paginationFooterSelectPageSizeInput = getAllByTestId(
      'textfield-input'
    )[1] as HTMLInputElement;
    expect(paginationFooterSelectPageSizeInput.value).toBe('Show 25');
  });

  it('should render destinations landing empty state', async () => {
    server.use(
      http.get('*/monitor/streams/destinations', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(
      <DestinationsLanding />,
      {
        initialRoute: '/datastream/destinations',
      }
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    getByText((text) => text.includes('Create a destination for cloud logs'));
  });
});
