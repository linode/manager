import { screen, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';

import { accountFactory, databaseInstanceFactory } from 'src/factories';
import DatabaseLanding from 'src/features/Databases/DatabaseLanding/DatabaseLanding';
import DatabaseRow from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { capitalize } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({ data: { restricted: false } }),
}));

vi.mock('src/queries/profile/profile', async () => {
  const actual = await vi.importActual('src/queries/profile/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';

describe('Database Table Row', () => {
  it('should render a database row', () => {
    const database = databaseInstanceFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<DatabaseRow database={database} />)
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
      wrapWithTableBody(<DatabaseRow database={database} />)
    );

    // Check to see if the row rendered the relative date
    getByText('1 day ago');
  });
});

describe('Database Table', () => {
  it('should render database landing table with items', async () => {
    server.use(
      http.get('*/databases/instances', () => {
        const databases = databaseInstanceFactory.buildList(1, {
          status: 'active',
        });
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getAllByText, getByTestId, queryAllByText } = renderWithTheme(
      <DatabaseLanding />
    );

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
    const mockAccount = accountFactory.build({
      capabilities: ['Managed Databases Beta'],
    });
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(mockAccount);
      })
    );
    server.use(
      http.get('*/databases/instances', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );
    const { getByTestId, getByText } = renderWithTheme(<DatabaseLanding />, {
      flags: { dbaasV2: { beta: true, enabled: true } },
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(
      getByText(
        "Deploy popular database engines such as MySQL and PostgreSQL using Linode's performant, reliable, and fully managed database solution."
      )
    ).toBeInTheDocument();
  });

  it('should render tabs with legacy and new databases ', async () => {
    server.use(
      http.get('*/databases/instances', () => {
        const databases = databaseInstanceFactory.buildList(5, {
          status: 'active',
        });

        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByTestId } = renderWithTheme(<DatabaseLanding />, {
      flags: { dbaasV2: { beta: true, enabled: true } },
    });

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const newDatabasesTab = screen.getByText('New Database Clusters');
    const legacyDatabasesTab = screen.getByText('Legacy Database Clusters');

    expect(newDatabasesTab).toBeInTheDocument();
    expect(legacyDatabasesTab).toBeInTheDocument();
  });

  it('should render logo in new databases tab ', async () => {
    server.use(
      http.get('*/databases/instances', () => {
        const databases = databaseInstanceFactory.buildList(5, {
          status: 'active',
        });
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByTestId } = renderWithTheme(<DatabaseLanding />, {
      flags: { dbaasV2: { beta: true, enabled: true } },
    });

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const newDatabaseTab = screen.getByText('New Database Clusters');
    fireEvent.click(newDatabaseTab);

    expect(screen.getByText('Powered by')).toBeInTheDocument();
  });

  it('should render a single legacy database table without logo ', async () => {
    server.use(
      http.get('*/databases/instances', () => {
        const databases = databaseInstanceFactory.buildList(5, {
          status: 'active',
        });
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByTestId } = renderWithTheme(<DatabaseLanding />, {
      flags: { dbaasV2: { beta: false, enabled: false } },
    });

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(1);

    const table = tables[0];

    const headers = within(table).getAllByRole('columnheader');
    expect(
      headers.some((header) => header.textContent === 'Configuration')
    ).toBe(true);
    expect(headers.some((header) => header.textContent === 'Nodes')).toBe(
      false
    );

    expect(screen.queryByText('Legacy Database Clusters')).toBeNull();
    expect(screen.queryByText('New Database Clusters')).toBeNull();
    expect(screen.queryByText('Powered by')).toBeNull();
  });
});

describe('Database Landing', () => {
  it('should have the "Create Database Cluster" button disabled for restricted users', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const { container, getByTestId } = renderWithTheme(<DatabaseLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const createClusterButton = container.querySelector('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toHaveTextContent('Create Database Cluster');
    expect(createClusterButton).toBeDisabled();
  });

  it('should have the "Create Database Cluster" button enabled for users with full access', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

    const { container, getByTestId } = renderWithTheme(<DatabaseLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const createClusterButton = container.querySelector('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toHaveTextContent('Create Database Cluster');
    expect(createClusterButton).not.toBeDisabled();
  });
});

describe('Database Landing', () => {
  it('should have the "Create Database Cluster" button disabled for restricted users', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const { container, getByTestId } = renderWithTheme(<DatabaseLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const createClusterButton = container.querySelector('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toHaveTextContent('Create Database Cluster');
    expect(createClusterButton).toBeDisabled();
  });

  it('should have the "Create Database Cluster" button enabled for users with full access', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

    const { container, getByTestId } = renderWithTheme(<DatabaseLanding />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const createClusterButton = container.querySelector('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toHaveTextContent('Create Database Cluster');
    expect(createClusterButton).not.toBeDisabled();
  });
});
