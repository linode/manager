import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import {
  evaluationPeriodOptions,
  pollingIntervalOptions,
} from '../../constants';
import { TriggerConditions } from './TriggerConditions';

import type { CreateAlertDefinitionForm } from '../types';

const EvaluationPeriodTestId = 'evaluation-period';

const PollingIntervalTestId = 'polling-interval';

describe('Trigger Conditions', () => {
  const user = userEvent.setup();

  it('should render all the components and names', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions maxScrapingInterval={0} name="trigger_conditions" />
      ),
    });
    expect(container.getByLabelText('Evaluation Period')).toBeInTheDocument();
    expect(container.getByLabelText('Polling Interval')).toBeInTheDocument();
    expect(
      container.getByText('Trigger alert when all criteria are met for')
    ).toBeInTheDocument();
    expect(
      container.getByText('consecutive occurrence(s).')
    ).toBeInTheDocument();
  });

  it('should render the tooltips for the Autocomplete components', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions maxScrapingInterval={0} name="trigger_conditions" />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });

    const evaluationPeriodContainer = container.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodToolTip = within(evaluationPeriodContainer).getByRole(
      'button',
      {
        name:
          'Defines the timeframe for collecting data in polling intervals to understand the service performance. Choose the data lookback period where the thresholds are applied to gather the information impactful for your business.',
      }
    );
    const pollingIntervalContainer = container.getByTestId(
      PollingIntervalTestId
    );
    const pollingIntervalToolTip = within(pollingIntervalContainer).getByRole(
      'button',
      {
        name: 'Choose how often you intend to evaluate the alert condition.',
      }
    );
    expect(evaluationPeriodToolTip).toBeInTheDocument();
    expect(pollingIntervalToolTip).toBeInTheDocument();
  });

  it('should render the Evaluation Period component with options happy path and select an option', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <TriggerConditions
            maxScrapingInterval={0}
            name="trigger_conditions"
          />
        ),
        useFormOptions: {
          defaultValues: {
            serviceType: 'linode',
          },
        },
      }
    );
    const evaluationPeriodContainer = container.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodInput = within(
      evaluationPeriodContainer
    ).getByRole('button', { name: 'Open' });

    user.click(evaluationPeriodInput);

    expect(
      await container.findByRole('option', {
        name: evaluationPeriodOptions.linode[1].label,
      })
    ).toBeInTheDocument();
    expect(
      await container.findByRole('option', {
        name: evaluationPeriodOptions.linode[2].label,
      })
    );

    await user.click(
      container.getByRole('option', {
        name: evaluationPeriodOptions.linode[0].label,
      })
    );

    expect(
      within(evaluationPeriodContainer).getByRole('combobox')
    ).toHaveAttribute('value', evaluationPeriodOptions.linode[0].label);
  });

  it('should render the Polling Interval component with options happy path and select an option', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <TriggerConditions
            maxScrapingInterval={0}
            name="trigger_conditions"
          />
        ),
        useFormOptions: {
          defaultValues: {
            serviceType: 'linode',
          },
        },
      }
    );
    const pollingIntervalContainer = container.getByTestId(
      PollingIntervalTestId
    );
    const pollingIntervalInput = within(
      pollingIntervalContainer
    ).getByRole('button', { name: 'Open' });

    user.click(pollingIntervalInput);

    expect(
      await container.findByRole('option', {
        name: pollingIntervalOptions.linode[1].label,
      })
    ).toBeInTheDocument();

    expect(
      await container.findByRole('option', {
        name: pollingIntervalOptions.linode[2].label,
      })
    );

    await user.click(
      container.getByRole('option', {
        name: pollingIntervalOptions.linode[0].label,
      })
    );
    expect(
      within(pollingIntervalContainer).getByRole('combobox')
    ).toHaveAttribute('value', pollingIntervalOptions.linode[0].label);
  });

  it('should be able to show the options that are greater than or equal to max scraping Interval', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions
          maxScrapingInterval={120}
          name="trigger_conditions"
        />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });
    const evaluationPeriodContainer = container.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodInput = within(
      evaluationPeriodContainer
    ).getByRole('button', { name: 'Open' });

    user.click(evaluationPeriodInput);

    expect(
      screen.queryByText(evaluationPeriodOptions.linode[0].label)
    ).not.toBeInTheDocument();

    const pollingIntervalContainer = container.getByTestId(
      PollingIntervalTestId
    );
    const pollingIntervalInput = within(
      pollingIntervalContainer
    ).getByRole('button', { name: 'Open' });
    user.click(pollingIntervalInput);
    expect(
      screen.queryByText(pollingIntervalOptions.linode[0].label)
    ).not.toBeInTheDocument();
  });
});
