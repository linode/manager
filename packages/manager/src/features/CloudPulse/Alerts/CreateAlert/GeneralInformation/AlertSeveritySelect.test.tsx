import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseAlertSeveritySelect } from './AlertSeveritySelect';

describe('EngineOption component tests', () => {
  it('should render the component when resource type is dbaas', () => {
    const { getByLabelText, getByTestId } = renderWithThemeAndHookFormContext({
      component: <CloudPulseAlertSeveritySelect name={'severity'} />,
    });
    expect(getByLabelText('Severity')).toBeInTheDocument();
    expect(getByTestId('severity')).toBeInTheDocument();
  });
  it('should render the options happy path', () => {
    renderWithThemeAndHookFormContext({
      component: <CloudPulseAlertSeveritySelect name="severity" />,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('option', { name: 'Info - 3' }));
    expect(screen.getByRole('option', { name: 'Low - 2' }));
  });
  it('should be able to select an option', () => {
    renderWithThemeAndHookFormContext({
      component: <CloudPulseAlertSeveritySelect name="severity" />,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'Medium - 1' }));
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Medium - 1');
  });
  it('should render the tooltip text', () => {
    const container = renderWithThemeAndHookFormContext({
      component: <CloudPulseAlertSeveritySelect name="severity" />,
    });

    const severityContainer = container.getByTestId('severity');
    fireEvent.click(severityContainer);

    expect(
      screen.getByRole('button', {
        name:
          'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab',
      })
    ).toBeVisible();
  });
});
