import * as React from 'react';

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
        alert={alert}
        handlers={{ handleDetails: () => vi.fn() }}
        services={mockServices}
      />
    );
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));
    expect(getByText(alert.label)).toBeVisible();
  });

  /**
   * As of now the styling for the status 'enabled' is decided, in the future if they decide on the
  other styles possible status values, will update them and test them accordingly.
   */
  it('should render the status field in green color if status is enabled', () => {
    const alert = alertFactory.build({ status: 'enabled' });
    const renderedAlert = (
      <AlertTableRow
        alert={alert}
        handlers={{ handleDetails: () => vi.fn() }}
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
    const link = `/monitor/cloudpulse/alerts/definitions/${alert.id}`;
    const renderedAlert = (
      <AlertTableRow
        alert={alert}
        handlers={{ handleDetails: () => vi.fn() }}
        services={mockServices}
      />
    );
    const { getByLabelText } = renderWithTheme(
      wrapWithTableBody(renderedAlert)
    );
    const labelElement = getByLabelText(alert.label);
    expect(labelElement).toHaveAttribute('href', link);
  });
});
