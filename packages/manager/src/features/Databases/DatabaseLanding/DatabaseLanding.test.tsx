import { capitalize } from '@linode/utilities';
import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';

import { accountFactory, databaseInstanceFactory } from 'src/factories';
import DatabaseLanding from 'src/features/Databases/DatabaseLanding/DatabaseLanding';
import DatabaseRow from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { formatDate } from 'src/utilities/formatDate';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({ data: { restricted: false } }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';
const accountEndpoint = '*/v4/account';
const databaseInstancesEndpoint = '*/databases/instances';

const managedDBBetaCapability = 'Managed Databases Beta';
const managedDBCapability = 'Managed Databases';

const newDBTabTitle = 'New Database Clusters';
const legacyDBTabTitle = 'Legacy Database Clusters';

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
    const mockAccount = accountFactory.build({
      capabilities: [managedDBBetaCapability],
    });
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(mockAccount);
      })
    );
    server.use(
      http.get(databaseInstancesEndpoint, () => {
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
      capabilities: [managedDBBetaCapability],
    });
    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(mockAccount);
      })
    );
    server.use(
      http.get(databaseInstancesEndpoint, () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    renderWithTheme(<DatabaseLanding />, {
      flags: { dbaasV2: { beta: true, enabled: true } },
    });

    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    const text = screen.getByText(
      "Deploy popular database engines such as MySQL and PostgreSQL using Linode's performant, reliable, and fully managed database solution."
    );

    expect(text).toBeInTheDocument();
  });

  it('should render tabs with legacy and new databases ', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({
            capabilities: [managedDBCapability, managedDBBetaCapability],
          })
        );
      })
    );
    server.use(
      http.get(databaseInstancesEndpoint, () => {
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

    const newDatabasesTab = screen.getByText(newDBTabTitle);
    const legacyDatabasesTab = screen.getByText(legacyDBTabTitle);

    expect(newDatabasesTab).toBeInTheDocument();
    expect(legacyDatabasesTab).toBeInTheDocument();
  });

  it('should render logo in new databases tab ', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({
            capabilities: [managedDBCapability, managedDBBetaCapability],
          })
        );
      })
    );
    server.use(
      http.get(databaseInstancesEndpoint, () => {
        const databases = databaseInstanceFactory.buildList(5, {
          status: 'active',
        });
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByTestId } = renderWithTheme(<DatabaseLanding />, {
      flags: { dbaasV2: { beta: true, enabled: true } },
    });

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const newDatabaseTab = screen.getByText(newDBTabTitle);
    fireEvent.click(newDatabaseTab);

    expect(screen.getByText('Powered by')).toBeInTheDocument();
  });

  it('should render a single legacy database table without logo ', async () => {
    server.use(
      http.get(databaseInstancesEndpoint, () => {
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

    expect(screen.queryByText(legacyDBTabTitle)).toBeNull();
    expect(screen.queryByText(newDBTabTitle)).toBeNull();
    expect(screen.queryByText('Powered by')).toBeNull();
  });

  it('should render a single new database table ', async () => {
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(
          accountFactory.build({
            capabilities: [managedDBBetaCapability],
          })
        );
      })
    );
    server.use(
      http.get(databaseInstancesEndpoint, () => {
        const databases = databaseInstanceFactory.buildList(5, {
          platform: 'rdbms-default',
          status: 'active',
        });
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByTestId } = renderWithTheme(<DatabaseLanding />, {
      flags: { dbaasV2: { beta: true, enabled: true } },
    });

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(1);

    expect(screen.getByText('Cluster Label')).toBeInTheDocument();

    expect(screen.queryByText(legacyDBTabTitle)).toBeInTheDocument();
    expect(screen.queryByText(newDBTabTitle)).toBeInTheDocument();
    expect(screen.queryByText('Powered by')).toBeInTheDocument();
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
    expect(createClusterButton).toBeEnabled();
  });

  it('should render a single new database table with action menu ', async () => {
    const databases = databaseInstanceFactory.buildList(5, {
      platform: 'rdbms-default',
      status: 'active',
    });
    server.use(
      http.get(databaseInstancesEndpoint, () => {
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByLabelText, getByTestId } = renderWithTheme(
      <DatabaseLanding />,
      {
        flags: { dbaasV2: { beta: false, enabled: true } },
      }
    );

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(1);

    const actionMenu = getByLabelText(
      `Action menu for Database ${databases[0].label}`
    );
    expect(actionMenu).toBeInTheDocument();
  });

  it('should open an action menu ', async () => {
    const databases = databaseInstanceFactory.buildList(5, {
      platform: 'rdbms-default',
      status: 'active',
    });
    server.use(
      http.get(databaseInstancesEndpoint, () => {
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <DatabaseLanding />,
      {
        flags: { dbaasV2: { beta: false, enabled: true } },
      }
    );

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const actionMenu = getByLabelText(
      `Action menu for Database ${databases[0].label}`
    );

    await fireEvent.click(actionMenu);

    getByText('Manage Access Controls');
    getByText('Reset Root Password');
    getByText('Resize');
    getByText('Delete');
  });
});
