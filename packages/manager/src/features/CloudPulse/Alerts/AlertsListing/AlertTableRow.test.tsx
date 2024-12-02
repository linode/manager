import * as React from 'react';

import { alertFactory } from 'src/factories/cloudpulse/alerts';
import { capitalize } from 'src/utilities/capitalize';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { alertSeverityOptions } from '../constants';
import { AlertTableRow } from './AlertTableRow';

describe('Alert Row', () => {
  it('should render an alert row', async () => {
    const alert = alertFactory.build();
    const renderedAlert = <AlertTableRow alert={alert} />;
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));
    expect(getByText(alert.label)).toBeVisible();
  });
  it('should render the severity field with its label not value', async () => {
    const severityValue = 0;
    const alert = alertFactory.build({ severity: severityValue });
    const renderedAlert = <AlertTableRow alert={alert} />;
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));
    const severity = alertSeverityOptions.find(
      (option) => option.value === severityValue
    )?.label;
    expect(getByText(severity!)).toBeVisible;
  });
  it('should render the status field in green color if status is enabled', () => {
    const statusValue = 'enabled';
    const alert = alertFactory.build({ status: statusValue });
    const renderedAlert = <AlertTableRow alert={alert} />;
    const { getByText } = renderWithTheme(wrapWithTableBody(renderedAlert));
    const statusElement = getByText(capitalize(statusValue));
    expect(getComputedStyle(statusElement).color).toBe('rgb(50, 205, 50)');
  });
});
