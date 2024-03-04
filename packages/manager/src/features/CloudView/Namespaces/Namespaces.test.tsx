import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { Namespaces } from './Namespaces';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'circle-progress';

describe('Namespaces Landing page', () => {
  it('should render namespace landing with empty state', async () => {
    server.use(
      rest.get('*/cloudview/namespaces', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<Namespaces />, {
      queryClient,
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(
      getByText(
        'Create Namespace to store and process metrics from your service for your customers'
      )
    ).toBeInTheDocument();
  });
});
