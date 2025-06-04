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

const serviceType = 'linode';
const entityId = '123';
const entityName = 'test-instance';
const alerts = [
  ...alertFactory.buildList(7, {
    entity_ids: [entityId],
    service_type: serviceType,
    status: 'enabled',
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
  it('Should render alert table', async () => {
    const { getByText } = renderWithTheme(
      <AlertInformationActionTable {...props} />
    );

    expect(getByText('Alert Name')).toBeInTheDocument();
    expect(getByText('Metric Threshold')).toBeInTheDocument();
    expect(getByText('Alert Type')).toBeInTheDocument();
    expect(getByText('Scope')).toBeInTheDocument();
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
    renderWithTheme(<AlertInformationActionTable {...props} />);

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

  it('Should have save button in disabled form when no changes are made', () => {
    renderWithTheme(<AlertInformationActionTable {...props} />);

    const saveButton = screen.getByTestId('save-alerts');
    expect(saveButton).toBeDisabled();
  });
});
