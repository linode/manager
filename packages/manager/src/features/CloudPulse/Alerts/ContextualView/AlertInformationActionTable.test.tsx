import { within } from '@testing-library/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories/cloudpulse/alerts';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertInformationActionTable } from './AlertInformationActionTable';

import type {
  AlertInformationActionTableProps,
  TableColumnHeader,
} from './AlertInformationActionTable';

const mockUpdateAlerts = vi.fn();

vi.mock('src/queries/cloudpulse/useAlertsMutation', async () => {
  const actual = await vi.importActual(
    'src/queries/cloudpulse/useAlertsMutation'
  );
  return {
    ...actual,
    useAlertsMutation: () => mockUpdateAlerts,
  };
});

const serviceType = 'linode';
const entityId = '123';
const entityName = 'test-instance';
const alerts = [
  ...alertFactory.buildList(7, {
    entity_ids: [entityId],
    service_type: serviceType,
    status: 'enabled',
  }),
  alertFactory.build({
    id: 9,
    entity_ids: [],
    service_type: serviceType,
    type: 'user',
    scope: 'entity',
  }),
  alertFactory.build({
    id: 10,
    entity_ids: [],
    service_type: serviceType,
    type: 'user',
    scope: 'account',
  }),
  alertFactory.build({
    id: 11,
    entity_ids: [],
    service_type: serviceType,
    type: 'user',
    scope: 'region',
  }),
];
const columns: TableColumnHeader[] = [
  { columnName: 'Alert Name', label: 'label' },
  { columnName: 'Metric Threshold', label: 'id' },
  { columnName: 'Alert Type', label: 'type' },
  { columnName: 'Scope', label: 'scope' },
];
const props: AlertInformationActionTableProps = {
  alerts,
  columns,
  entityId,
  entityName,
  serviceType,
  orderByColumn: 'Alert Name',
};

describe('Alert Listing Reusable Table for contextual view', () => {
  beforeEach(() => {
    mockUpdateAlerts.mockClear();
    mockUpdateAlerts.mockResolvedValue({});
  });

  it('Should render alert table', async () => {
    renderWithTheme(<AlertInformationActionTable {...props} />);

    expect(screen.getByText('Alert Name')).toBeVisible();
    expect(screen.getByText('Metric Threshold')).toBeVisible();
    expect(screen.getByText('Alert Type')).toBeVisible();
    expect(screen.getByText('Scope')).toBeVisible();
  });

  it('Should show message for empty table', () => {
    const { getByText } = renderWithTheme(
      <AlertInformationActionTable {...props} alerts={[]} />
    );

    expect(getByText('No data to display.')).toBeInTheDocument();
  });

  it('Should render table row toggle in table row', async () => {
    const { findByTestId } = renderWithTheme(
      <AlertInformationActionTable {...props} />
    );
    const alert = alerts[0];
    const row = await findByTestId(alert.id);

    const checkbox = await within(row).findByRole('checkbox');

    expect(checkbox).toHaveProperty('checked');
  });

  it('Should show confirm dialog on save button click when changes are made', async () => {
    renderWithTheme(
      <AlertInformationActionTable
        {...props}
        serviceType="dbaas"
        showConfirmationDialog
      />
    );

    // First toggle an alert to make changes
    const alert = alerts[0];
    const row = await screen.findByTestId(alert.id);
    const toggle = await within(row).findByRole('checkbox');
    await userEvent.click(toggle);

    // Now the save button should be enabled
    const saveButton = screen.getByTestId('save-alerts');
    expect(saveButton).not.toBeDisabled();

    // Click save and verify dialog appears
    await userEvent.click(saveButton);
    expect(screen.getByTestId('confirmation-dialog')).toBeVisible();
  });

  it('Should hide confirm dialog on save button click when changes are made', async () => {
    renderWithTheme(
      <AlertInformationActionTable {...props} serviceType="dbaas" />
    );

    // First toggle an alert to make changes
    const alert = alerts[0];
    const row = await screen.findByTestId(alert.id);
    const toggle = await within(row).findByRole('checkbox');
    await userEvent.click(toggle);

    // Now the save button should be enabled
    const saveButton = screen.getByTestId('save-alerts');
    expect(saveButton).not.toBeDisabled();

    // Click save and verify dialog appears
    await userEvent.click(saveButton);
    expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
  });

  it('Should have save button in disabled form when no changes are made', () => {
    renderWithTheme(
      <AlertInformationActionTable {...props} serviceType="dbaas" />
    );

    const saveButton = screen.getByTestId('save-alerts');
    expect(saveButton).toBeDisabled();
  });

  it('Should send correct payload to the API when save button is clicked in edit mode', async () => {
    renderWithTheme(
      <AlertInformationActionTable
        {...props}
        alerts={alerts}
        serviceType="dbaas"
      />
    );

    // Toggle entity-level user alert with ID 2 to enable it
    const userAlertRow = await screen.findByTestId('9');
    await userEvent.click(await within(userAlertRow).findByRole('checkbox'));

    const saveButton = screen.getByTestId('save-alerts');
    expect(saveButton).not.toBeDisabled();
    await userEvent.click(saveButton);

    // Verify that account and region level alerts are not included in the payload
    expect(mockUpdateAlerts).toHaveBeenCalledWith({
      system_alerts: [1, 2, 3, 4, 5, 6, 7],
      user_alerts: [9],
    });
  });

  it('Should not render save button for linode service type', () => {
    // For linode, save is handled by the service owner component (e.g. LinodeAlerts unified save button).
    renderWithTheme(<AlertInformationActionTable {...props} />); // props.serviceType is 'linode'

    expect(screen.queryByTestId('save-alerts')).not.toBeInTheDocument();
  });

  it('Should call onToggleAlert with correct payload when a toggle is clicked for linode service type', async () => {
    // Even though the save button is hidden for linode, the toggle still fires onToggleAlert
    // so the service owner can collect the payload for its own save flow.
    const onToggleAlert = vi.fn();
    renderWithTheme(
      <AlertInformationActionTable {...props} onToggleAlert={onToggleAlert} />
    );

    // Toggle entity-level user alert id 9 to enable it
    const userAlertRow = await screen.findByTestId('9');
    await userEvent.click(within(userAlertRow).getByRole('checkbox'));

    // Raw payload passed to service owner: system_alerts unchanged, user_alerts with the newly toggled alert id 9,
    // and hasUnsavedChanges is true
    expect(onToggleAlert).toHaveBeenCalledWith(
      {
        system_alerts: [1, 2, 3, 4, 5, 6, 7],
        user_alerts: [9],
      },
      true // hasUnsavedChanges
    );
  });
});
