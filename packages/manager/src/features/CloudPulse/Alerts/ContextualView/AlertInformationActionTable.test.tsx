import { within } from '@testing-library/react';
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
];
const props: AlertInformationActionTableProps = {
  alerts,
  columns,
  entityId,
  entityName,
  orderByColumn: 'Alert Name',
};

describe('Alert Listing Reusable Table for contextual view', () => {
  it('Should render alert table', () => {
    const { getByText } = renderWithTheme(
      <AlertInformationActionTable {...props} />
    );

    expect(getByText('Alert Name')).toBeInTheDocument();
    expect(getByText('Metric Threshold')).toBeInTheDocument();
    expect(getByText('Alert Type')).toBeInTheDocument();
  });

  it('Should show message for empty table', () => {
    const { getByText } = renderWithTheme(
      <AlertInformationActionTable {...props} alerts={[]} />
    );

    expect(getByText('No data to display.')).toBeInTheDocument();
  });

  it('Shoud render table row toggle in table row', async () => {
    const { findByTestId } = renderWithTheme(
      <AlertInformationActionTable {...props} />
    );
    const alert = alerts[0];
    const row = await findByTestId(alert.id);

    const checkbox = await within(row).findByRole('checkbox');

    expect(checkbox).toHaveProperty('checked');
  });

  it('Should show confirm dialog on checkbox click', async () => {
    const { findByTestId, findByText } = renderWithTheme(
      <AlertInformationActionTable {...props} />
    );
    const alert = alerts[0];
    const row = await findByTestId(alert.id);

    const checkbox = await within(row).findByRole('checkbox');

    await userEvent.click(checkbox);

    const text = await findByText(`Disable ${alert.label} Alert?`);
    expect(text).toBeInTheDocument();
  });
});
