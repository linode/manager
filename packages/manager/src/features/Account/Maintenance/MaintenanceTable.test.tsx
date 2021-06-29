import * as React from 'react';
import { accountMaintenanceFactory } from 'src/factories';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';
import MaintenanceTableRow from './MaintenanceTableRow';
import MaintenanceTable from './MaintenanceTable';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { rest, server } from 'src/mocks/testServer';
import { makeResourcePage } from 'src/mocks/serverHandlers';

const loadingTestId = 'table-row-loading';

describe('Maintenance Table Row', () => {
  it('should render the entity label', () => {
    const maintenance = accountMaintenanceFactory.build();
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<MaintenanceTableRow {...maintenance} />)
    );
    getByText(String(maintenance.entity.label));
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

  // it('should render maintenance table with empty state', async () => {
  //   server.use(
  //     rest.get('*/account/maintenance*', (req, res, ctx) => {
  //       return res(
  //         ctx.json({
  //           pages: 0,
  //           data: [],
  //           results: 0,
  //           page: 0,
  //         })
  //       );
  //     })
  //   );
  //   renderWithTheme(<MaintenanceTable type="Linode" />);

  //   expect(screen.getByTestId('table-row-empty')).toBeInTheDocument();

  //   // Check for custom empty state
  //   screen.getByText('No pending maintenance.');
  // });
});
