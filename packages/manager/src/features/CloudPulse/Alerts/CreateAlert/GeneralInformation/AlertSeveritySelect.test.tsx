import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseAlertSeveritySelect } from './AlertSeveritySelect';

describe('Severity component tests', () => {
  it('should render the component', () => {
    const { getByLabelText, getByTestId } = renderWithThemeAndHookFormContext({
      component: <CloudPulseAlertSeveritySelect name="severity" />,
    });
    expect(getByLabelText('Severity')).toBeInTheDocument();
    expect(getByTestId('severity')).toBeInTheDocument();
  });
  it('should render the options happy path', async () => {
    renderWithThemeAndHookFormContext({
      component: <CloudPulseAlertSeveritySelect name="severity" />,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('option', { name: 'Info' }));
    expect(screen.getByRole('option', { name: 'Low' }));
  });
  it('should be able to select an option', async () => {
    renderWithThemeAndHookFormContext({
      component: <CloudPulseAlertSeveritySelect name="severity" />,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Medium' })
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Medium');
  });
  it('should render the tooltip text', async () => {
    const container = renderWithThemeAndHookFormContext({
      component: <CloudPulseAlertSeveritySelect name="severity" />,
    });

    const severityContainer = container.getByTestId('severity');
    await userEvent.click(severityContainer);

    expect(
      screen.getByRole('button', {
        name: 'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab.',
      })
    ).toBeVisible();
  });
});
