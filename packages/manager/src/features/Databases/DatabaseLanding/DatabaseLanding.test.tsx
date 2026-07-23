import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { accountFactory, databaseInstanceFactory } from 'src/factories';
import { DatabaseLanding } from 'src/features/Databases/DatabaseLanding/DatabaseLanding';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { openActionMenu } from '../shared/utilities/testHelpers';

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
const accountEndpoint = '*/account';
const databaseInstancesEndpoint = '*/databases/instances';

const managedDBCapability = 'Managed Databases';

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
        });
        return HttpResponse.json(makeResourcePage(databases));
      })
    );
    const { getAllByText, getByTestId, queryAllByText, queryByText } =
      renderWithTheme(<DatabaseLanding />);
    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId), {
      timeout: 30000,
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
    const { getByTestId, getByText } = renderWithTheme(<DatabaseLanding />);
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
      status: 'active',
    });
    server.use(
      http.get(databaseInstancesEndpoint, () => {
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByLabelText, getByTestId } = renderWithTheme(
      <DatabaseLanding />
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

  it('should open an action menu', async () => {
    const databases = databaseInstanceFactory.buildList(5, {
      status: 'active',
    });
    server.use(
      http.get(databaseInstancesEndpoint, () => {
        return HttpResponse.json(makeResourcePage(databases));
      })
    );

    const { getByTestId, getAllByTestId } = renderWithTheme(
      <DatabaseLanding />
    );

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const menu = getAllByTestId('database-action-menu')[0];

    await openActionMenu(menu);

    // Search for menu items and check that they're displayed in the document.
    const manageAccessMenuItem = getAllByTestId('Manage Access Controls')[0];
    const resetPasswordMenuItem = getAllByTestId('Reset Root Password')[0];
    const resizeMenuItem = getAllByTestId('Resize')[0];
    const deleteMenuItem = getAllByTestId('Delete')[0];

    expect(manageAccessMenuItem).toBeInTheDocument();
    expect(resetPasswordMenuItem).toBeInTheDocument();
    expect(resizeMenuItem).toBeInTheDocument();
    expect(deleteMenuItem).toBeInTheDocument();
  });
});
