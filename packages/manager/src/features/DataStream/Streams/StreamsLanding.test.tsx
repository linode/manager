import { waitForElementToBeRemoved, within } from '@testing-library/react';
import * as React from 'react';
import { expect } from 'vitest';

import { streamFactory } from 'src/factories/datastream';
import { StreamsLanding } from 'src/features/DataStream/Streams/StreamsLanding';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';

describe('Streams Landing Table', () => {
  it('should render streams landing tab header and table with items PaginationFooter', async () => {
    server.use(
      http.get('*/monitor/streams', () => {
        return HttpResponse.json(makeResourcePage(streamFactory.buildList(30)));
      })
    );

    const {
      getByText,
      queryByTestId,
      getAllByTestId,
      getByPlaceholderText,
      getByLabelText,
      getByRole,
    } = renderWithTheme(<StreamsLanding />, {
      initialRoute: '/datastream/streams',
    });

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    // search text input
    getByPlaceholderText('Search for a Stream');

    // select
    getByLabelText('Status');

    // button
    getByText('Create Stream');

    // Table column headers
    getByText('Name');
    within(getByRole('table')).getByText('Status');
    getByText('ID');
    getByText('Destination Type');

    // PaginationFooter
    const paginationFooterSelectPageSizeInput = getAllByTestId(
      'textfield-input'
    )[2] as HTMLInputElement;
    expect(paginationFooterSelectPageSizeInput.value).toBe('Show 25');
  });

  it('should render streams landing empty state', async () => {
    server.use(
      http.get('*/monitor/streams', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(<StreamsLanding />, {
      initialRoute: '/datastream/streams',
    });

    const loadingElement = queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }

    getByText((text) =>
      text.includes('Create a data stream and configure delivery of cloud logs')
    );
  });
});
