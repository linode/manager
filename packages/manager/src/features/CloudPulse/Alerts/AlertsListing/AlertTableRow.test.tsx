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

const queryMocks = vi.hoisted(() => ({
  useEditAlertDefinition: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useEditAlertDefinition: queryMocks.useEditAlertDefinition,
}));

queryMocks.useEditAlertDefinition.mockReturnValue({
  isError: false,
  mutateAsync: vi.fn().mockResolvedValue({}),
  reset: vi.fn(),
});

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
    const firstActionMenu = getAllByLabelText(
      `Action menu for Alert ${alert.label}`
    )[0];
    await userEvent.click(firstActionMenu);
    expect(getByTestId('Show Details')).toBeInTheDocument();
  });

  it('should have enable action item present inside action menu if the user created alert is disabled', async () => {
    const alert = alertFactory.build({ status: 'disabled', type: 'user' });
    const { getAllByLabelText, getByText } = renderWithTheme(
      <AlertTableRow
        handlers={{
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
        }}
        alert={alert}
        services={mockServices}
      />
    );
    const firstActionMenu = getAllByLabelText(
      `Action menu for Alert ${alert.label}`
    )[0];
    await userEvent.click(firstActionMenu);
    expect(getByText('Enable')).toBeInTheDocument(); // enable alert functionality is present in action items
    await userEvent.click(getByText('Enable')); // click the enable button to enable alert
    expect(
      getByText('Alert enabled') // validate whether snackbar is displayed properly if alert is enabled successfully
    ).toBeInTheDocument();
  });

  it('should have disable action item present inside action menu if the user created alert is enabled', async () => {
    const alert = alertFactory.build({ type: 'user' });
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertTableRow
        handlers={{
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleEnableDisable: vi.fn(),
        }}
        alert={alert}
        services={mockServices}
      />
    );
    const ActionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(ActionMenu);
    expect(getByText('Disable')).toBeInTheDocument();
    await userEvent.click(getByText('Disable'));
    expect(getByText('Alert disabled')).toBeInTheDocument();
  });

  it('should show error message if enabling or disabling alert is failed', async () => {
    queryMocks.useEditAlertDefinition.mockReturnValue({
      isError: true,
      mutateAsync: vi.fn().mockRejectedValue(Error('Disabling alert failed')),
      reset: vi.fn(),
    });
    const alert = alertFactory.build({ type: 'user' });
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertTableRow
        handlers={{
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleEnableDisable: vi.fn(),
        }}
        alert={alert}
        services={mockServices}
      />
    );
    const ActionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(ActionMenu);
    expect(getByText('Disable')).toBeInTheDocument();
    await userEvent.click(getByText('Disable'));
    expect(
      getByText('Disabling alert failed') // validate whether snackbar is displayed properly if an error is encountered while disabling an alert
    ).toBeInTheDocument();
  });
});
