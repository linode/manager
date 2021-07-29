import * as React from 'react';
import { accountMaintenanceFactory } from 'src/factories';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';
import MaintenanceTableRow from './MaintenanceTableRow';
import MaintenanceTable from './MaintenanceTable';
import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { rest, server } from 'src/mocks/testServer';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { queryPresets } from 'src/queries/base';
import { QueryClient } from 'react-query';
import { parseAPIDate } from 'src/utilities/date';
import formatDate from 'src/utilities/formatDate';

const queryClient = new QueryClient({
  defaultOptions: { queries: queryPresets.oneTimeFetch },
});

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const loadingTestId = 'table-row-loading';

describe('Maintenance Table Row', () => {
  const maintenance = accountMaintenanceFactory.build();
  it('should render the maintenance event', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<MaintenanceTableRow {...maintenance} />)
    );
    getByText(maintenance.entity.label);
    getByText(formatDate(maintenance.when));
    getByText(maintenance.reason);
  });

  it('should render a relative time', () => {
    renderWithTheme(
      wrapWithTableBody(<MaintenanceTableRow {...maintenance} />)
    );
    const { getByText } = within(screen.getByTestId('relative-date'));

    expect(
      getByText(parseAPIDate(maintenance.when).toRelative()!)
    ).toBeInTheDocument();
  });
});

describe('Maintenance Table', () => {
  it('should render maintenance table with items', async () => {
    server.use(
      rest.get('*/account/maintenance', (req, res, ctx) => {
        const accountMaintenance = accountMaintenanceFactory.buildList(1, {
          status: 'pending',
        });
        return res(ctx.json(makeResourcePage(accountMaintenance)));
      })
    );
    renderWithTheme(<MaintenanceTable type="Linode" />);

    // Loading state should render
    expect(screen.getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(screen.getByTestId(loadingTestId));

    // Static text and table column headers
    screen.getAllByText('Linodes');
    screen.getAllByText('Label');
    screen.getAllByText('Date');

    // Table data from mock api
    screen.queryAllByText('Scheduled');
  });

  it('should render the CSV download button if there are items', async () => {
    renderWithTheme(<MaintenanceTable type="Linode" />);

    screen.getByText('Download CSV');
  });

  it('should render maintenance table with empty state', async () => {
    server.use(
      rest.get('*/account/maintenance', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    renderWithTheme(<MaintenanceTable type="Linode" />, { queryClient });

    expect(await screen.findByTestId('table-row-empty')).toBeInTheDocument();

    // Check for custom empty state
    screen.getByText('No pending maintenance.');
  });
});
