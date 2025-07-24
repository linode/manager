import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { streamFactory } from 'src/factories/datastream';
import { StreamsLanding } from 'src/features/DataStream/Streams/StreamsLanding';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';

describe('Streams Landing Table', () => {
  it('should render streams landing table with items PaginationFooter', async () => {
    server.use(
      http.get('*/monitor/streams', () => {
        return HttpResponse.json(makeResourcePage(streamFactory.buildList(30)));
      })
    );

    const { getByText, queryByTestId, getByTestId } = await renderWithTheme(
      <StreamsLanding />
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    // Table column headers
    getByText('Name');
    getByText('Status');
    getByText('ID');
    getByText('Destination Type');

    // PaginationFooter
    const paginationFooterSelectPageSizeInput = getByTestId(
      'textfield-input'
    ) as HTMLInputElement;
    expect(paginationFooterSelectPageSizeInput.value).toBe('Show 25');
  });

  it('should render images landing empty state', async () => {
    server.use(
      http.get('*/monitor/streams', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, queryByTestId } = await renderWithTheme(
      <StreamsLanding />
    );

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    expect(
      getByText((text) =>
        text.includes(
          'Create a data stream and configure delivery of cloud logs'
        )
      )
    ).toBeInTheDocument();
  });
});
