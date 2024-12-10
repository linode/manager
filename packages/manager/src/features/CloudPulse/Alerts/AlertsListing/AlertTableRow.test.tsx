import * as React from 'react';

import { alertFactory } from 'src/factories/cloudpulse/alerts';
import { capitalize } from 'src/utilities/capitalize';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { AlertTableRow } from './AlertTableRow';

describe('Alert Row', () => {
  it('should render an alert row', async () => {
    const alert = alertFactory.build();
    const renderedAlert = <AlertTableRow alert={alert} />;
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));
    expect(getByText(alert.label)).toBeVisible();
  });

  /**
   * As of now the styling for the status 'enabled' is decided, in the future if they decide on the
  other styles possible status values, will update them and test them accordingly.
   */
  it('should render the status field in green color if status is enabled', () => {
    const statusValue = 'enabled';
    const alert = alertFactory.build({ status: statusValue });
    const renderedAlert = <AlertTableRow alert={alert} />;
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));
    const statusElement = getByText(capitalize(statusValue));
    expect(getComputedStyle(statusElement).color).toBe('rgb(0, 176, 80)');
  });
});
