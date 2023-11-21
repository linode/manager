import { waitForElementToBeRemoved } from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';
import { QueryClient } from '@tanstack/react-query';

import { databaseInstanceFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { capitalize } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import DatabaseLanding from './DatabaseLanding';
import DatabaseRow from './DatabaseRow';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'circle-progress';

describe('Database Table Row', () => {
  it('should render a database row', () => {
    const database = databaseInstanceFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<DatabaseRow database={database} />),
      { queryClient }
    );

    // Check to see if the row rendered some data
    getByText(database.label);
    getByText(formatDate(database.created));
    getByText(capitalize(database.status));
  });

  it('should render a relative time in the created column if the database was created in the last 3 days', () => {
    const database = databaseInstanceFactory.build({
      created: DateTime.local().minus({ days: 1 }).toISO(),
    });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<DatabaseRow database={database} />),
      { queryClient }
    );

    // Check to see if the row rendered the relative date
    getByText('1 day ago');
  });
});

describe('Database Table', () => {
  it('should render database landing table with items', async () => {
    server.use(
      rest.get('*/databases/instances', (req, res, ctx) => {
        const databases = databaseInstanceFactory.buildList(1, {
          status: 'active',
        });
        return res(ctx.json(makeResourcePage(databases)));
      })
    );

    const {
      getAllByText,
      getByTestId,
      queryAllByText,
    } = renderWithTheme(<DatabaseLanding />, { queryClient });

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Static text and table column headers
    getAllByText('Cluster Label');
    getAllByText('Status');
    getAllByText('Configuration');
    getAllByText('Engine');
    getAllByText('Region');
    getAllByText('Created');

    // Check to see if the mocked API data rendered in the table
    queryAllByText('Active');
  });

  it('should render database landing with empty state', async () => {
    server.use(
      rest.get('*/databases/instances', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<DatabaseLanding />, {
      queryClient,
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(
      getByText(
        "Deploy popular database engines such as MySQL and PostgreSQL using Linode's performant, reliable, and fully managed database solution."
      )
    ).toBeInTheDocument();
  });
});
