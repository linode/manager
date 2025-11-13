import { capitalize } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import * as React from 'react';

import { alertFactory } from 'src/factories/cloudpulse/alerts';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { AlertTableRow } from './AlertTableRow';

import type { Item } from '../constants';
import type { CloudPulseServiceType } from '@linode/api-v4';

const mockServices: Item<string, CloudPulseServiceType>[] = [
  {
    label: 'Linode',
    value: 'linode',
  },
  {
    label: 'Databases',
    value: 'dbaas',
  },
];

const flags = {
  aclpAlerting: {
    enabled: true,
    editDisabledStatuses: ['failed', 'in progress'],
  },
};

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', async (importOriginal) => ({
  ...(await importOriginal()),
  useFlags: queryMocks.useFlags,
}));

describe('Alert Row', () => {
  it('should render an alert row', async () => {
    const alert = alertFactory.build();
    const renderedAlert = (
      <AlertTableRow
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
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
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
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
    history.push('/alerts/definitions');
    const link = `/alerts/definitions/detail/${alert.service_type}/${alert.id}`;
    const renderedAlert = (
      <AlertTableRow
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
        services={mockServices}
      />
    );
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));

    const labelElement = getByText(alert.label);
    expect(labelElement.closest('a')).toHaveAttribute('href', link);
  });

  it('should have the show details action item present inside action menu', async () => {
    const alert = alertFactory.build({ status: 'enabled' });
    const { getAllByLabelText, getByTestId } = renderWithTheme(
      <AlertTableRow
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
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
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertTableRow
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
        services={mockServices}
      />
    );
    const ActionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(ActionMenu);
    expect(getByText('Enable')).toBeInTheDocument();
  });

  it('should have disable action item present inside action menu if the user created alert is enabled', async () => {
    const alert = alertFactory.build({ type: 'user' });
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertTableRow
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
        services={mockServices}
      />
    );
    const ActionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(ActionMenu);
    expect(getByText('Disable')).toBeInTheDocument();
  });

  it("should disable 'Disable' action item in menu if alert has no enabled/disabled status", async () => {
    const alert = alertFactory.build({ status: 'in progress', type: 'user' });
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertTableRow
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
        services={mockServices}
      />
    );
    const ActionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(ActionMenu);
    expect(getByText('In Progress')).toBeInTheDocument();
    expect(getByText('Disable').closest('li')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it("should disable 'Edit' action item in menu if alert has no enabled/disabled status", async () => {
    const alert = alertFactory.build({ status: 'in progress', type: 'user' });
    queryMocks.useFlags.mockReturnValue(flags);
    const { getByLabelText, getByText } = renderWithTheme(
      <AlertTableRow
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
        services={mockServices}
      />,
      {
        flags: {
          aclpAlerting: {
            editDisabledStatuses: ['failed', 'in progress'],
            accountAlertLimit: 10,
            accountMetricLimit: 100,
            alertDefinitions: true,
            notificationChannels: false,
            recentActivity: false,
          },
        },
      }
    );
    const ActionMenu = getByLabelText(`Action menu for Alert ${alert.label}`);
    await userEvent.click(ActionMenu);
    expect(getByText('In Progress')).toBeInTheDocument();
    expect(getByText('Edit').closest('li')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should show the delete action item for the user alert', async () => {
    const alert = alertFactory.build({ type: 'user' });
    renderWithTheme(
      <AlertTableRow
        alert={alert}
        handlers={{
          handleDelete: vi.fn(),
          handleDetails: vi.fn(),
          handleEdit: vi.fn(),
          handleStatusChange: vi.fn(),
        }}
        services={mockServices}
      />
    );
    const ActionMenu = screen.getByLabelText(
      `Action menu for Alert ${alert.label}`
    );
    await userEvent.click(ActionMenu);
    expect(screen.getByText('Delete')).toBeVisible();
  });
});
