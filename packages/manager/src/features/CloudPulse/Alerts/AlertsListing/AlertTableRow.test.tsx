import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router-dom';

import { alertFactory } from 'src/factories/cloudpulse/alerts';
import { capitalize } from 'src/utilities/capitalize';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { AlertTableRow } from './AlertTableRow';

import type { Item } from '../constants';
import type { AlertServiceType } from '@linode/api-v4';

const mockServices: Item<string, AlertServiceType>[] = [
  {
    label: 'Linode',
    value: 'linode',
  },
  {
    label: 'Databases',
    value: 'dbaas',
  },
];
describe('Alert Row', () => {
  it('should render an alert row', async () => {
    const alert = alertFactory.build();
    const renderedAlert = (
      <AlertTableRow
        handlers={{
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
        }}
        alert={alert}
        services={mockServices}
      />
    );
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));
    expect(getByText(alert.label)).toBeVisible();
  });

  it('should render the status field in green color if status is enabled', () => {
    const alert = alertFactory.build({ status: 'enabled' });
    const renderedAlert = (
      <AlertTableRow
        handlers={{
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
        }}
        alert={alert}
        services={mockServices}
      />
    );
    const { getByTestId, getByText } = renderWithTheme(
      wrapWithTableBody(renderedAlert)
    );
    expect(getByText(capitalize('enabled'))).toBeVisible();

    expect(getComputedStyle(getByTestId('status-icon')).backgroundColor).toBe(
      'rgb(0, 176, 80)'
    );
  });

  it('alert labels should have hyperlinks to the details page', () => {
    const alert = alertFactory.build({ status: 'enabled' });
    const history = createMemoryHistory();
    history.push('/monitor/alerts/definitions');
    const link = `/monitor/alerts/definitions/detail/${alert.service_type}/${alert.id}`;
    const renderedAlert = (
      <Router history={history}>
        <AlertTableRow
          handlers={{
            handleDetails: vi.fn(),
            handleEdit: vi.fn(),
          }}
          alert={alert}
          services={mockServices}
        />
      </Router>
    );
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));

    const labelElement = getByText(alert.label);
    expect(labelElement.closest('a')).toHaveAttribute('href', link);
  });

  it('should have the show details action item present inside action menu', async () => {
    const alert = alertFactory.build({ status: 'enabled' });
    const { getAllByLabelText, getByTestId } = renderWithTheme(
      <AlertTableRow
        handlers={{
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
        }}
        alert={alert}
        services={mockServices}
      />
    );
    const firstActionMenu = getAllByLabelText('Action menu for Alert')[0];
    await userEvent.click(firstActionMenu);
    expect(getByTestId('Show Details')).toBeInTheDocument();
  });
});
