import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import * as React from 'react';

import { accountMaintenanceFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { MaintenanceTable } from './MaintenanceTable';
import { MaintenanceTableRow } from './MaintenanceTableRow';

beforeAll(() => mockMatchMedia());

const loadingTestId = 'table-row-loading';

describe('Maintenance Table Row', () => {
  const maintenance = accountMaintenanceFactory.build();
  it('should render the maintenance event', async () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <MaintenanceTableRow maintenance={maintenance} tableType="upcoming" />
      )
    );
    getByText(maintenance.entity.label);
    if (maintenance.when) {
      getByText(formatDate(maintenance.when));
    }
  });

  it('should render a relative time', async () => {
    renderWithTheme(
      wrapWithTableBody(
        <MaintenanceTableRow maintenance={maintenance} tableType="upcoming" />
      )
    );
    const { getByText } = within(screen.getByTestId('relative-date'));

    if (maintenance.when) {
      expect(
        getByText(parseAPIDate(maintenance.when).toRelative()!)
      ).toBeInTheDocument();
    }
  });
});

describe('Maintenance Table', () => {
  it('should render maintenance table with items', async () => {
    server.use(
      http.get('*/account/maintenance', () => {
        const accountMaintenance = accountMaintenanceFactory.buildList(1, {
          status: 'pending',
        });
        return HttpResponse.json(makeResourcePage(accountMaintenance));
      })
    );
    renderWithTheme(<MaintenanceTable type="in progress" />);

    // Loading state should render
    expect(screen.getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(screen.getByTestId(loadingTestId));

    // Static text and table column headers
    screen.getAllByText('in progress');
    screen.getAllByText('Label');
    screen.getAllByText('Date');

    // Table data from mock api
    screen.queryAllByText('Scheduled');
  });

  it('should render the CSV download button if there are items', async () => {
    renderWithTheme(<MaintenanceTable type="in progress" />);

    screen.getByText('Download CSV');
  });

  it('should render maintenance table with empty state', async () => {
    server.use(
      http.get('*/account/maintenance', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    renderWithTheme(<MaintenanceTable type="in progress" />);

    expect(await screen.findByTestId('table-row-empty')).toBeInTheDocument();

    // Check for custom empty state
    screen.getByText('No in progress maintenance.');
  });

  it('should render tooltip icon next to status for upcoming maintenance', async () => {
    server.use(
      http.get('*/account/maintenance', () => {
        const accountMaintenance = accountMaintenanceFactory.buildList(1, {
          status: 'scheduled',
        });
        return HttpResponse.json(makeResourcePage(accountMaintenance));
      })
    );

    await renderWithTheme(<MaintenanceTable type="upcoming" />);

    // Wait for loading to complete
    await waitForElementToBeRemoved(screen.getByTestId(loadingTestId));

    // The tooltip icon should be present with the correct data-testid
    expect(
      screen.getByTestId('maintenance-status-tooltip')
    ).toBeInTheDocument();
  });
});
