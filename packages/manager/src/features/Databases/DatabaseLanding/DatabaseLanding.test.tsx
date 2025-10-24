import { capitalize } from '@linode/utilities';
import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';

import { accountFactory, databaseInstanceFactory } from 'src/factories';
import { DatabaseLanding } from 'src/features/Databases/DatabaseLanding/DatabaseLanding';
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

const defaultFlags = { dbaasV2: { beta: false, enabled: true } };

beforeAll(() => mockMatchMedia());

const loadingTestId = 'circle-progress';
const accountEndpoint = '*/account';
const databaseInstancesEndpoint = '*/databases/instances';

const managedDBCapability = 'Managed Databases';

describe('Database Table Row', () => {
  it('should render a database row', async () => {
    const database = databaseInstanceFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<DatabaseRow database={database} />)
    );

    // Check to see if the row rendered some data
    getByText(database.label);
    getByText(formatDate(database.created));
    getByText(capitalize(database.status));
  });

  it('should render a relative time in the created column if the database was created in the last 3 days', async () => {
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
      capabilities: [managedDBCapability],
    });
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(mockAccount);
      }),
      http.get(databaseInstancesEndpoint, () => {
        const databases = databaseInstanceFactory.buildList(1, {
          status: 'active',
          platform: 'rdbms-default',
        });
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getAllByText, getByTestId, queryAllByText, queryByText } =
      renderWithTheme(<DatabaseLanding />, {
        flags: defaultFlags,
      });

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId), {
      timeout: 3000,
    });

    // Static text and table column headers
    getAllByText('Cluster Label');
    getAllByText('Status');
    getAllByText('Engine');
    getAllByText('Region');
    getAllByText('Created');

    // Check to see if the mocked API data rendered in the table
    queryAllByText('Active');

    // Check that logo renders
    queryByText('Powered by');
  });

  it('should render database landing with empty state', async () => {
    const mockAccount = accountFactory.build({
      capabilities: [managedDBCapability],
    });
    server.use(
      http.get(accountEndpoint, () => {
        return HttpResponse.json(mockAccount);
      })
    );
    server.use(
      http.get(databaseInstancesEndpoint, () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );
    const { getByTestId, getByText } = renderWithTheme(<DatabaseLanding />, {
      flags: defaultFlags,
    });

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(
      getByText(
        "Deploy popular database engines such as MySQL and PostgreSQL using Linode's performant, reliable, and fully managed database solution."
      )
    ).toBeInTheDocument();
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
        flags: defaultFlags,
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
        flags: defaultFlags,
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
