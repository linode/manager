import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { TriggerConditions } from './TriggerConditions';

import type { CreateAlertDefinitionForm } from '../types';

const EvaluationPeriodTestId = 'evaluation-period';

const PollingIntervalTestId = 'polling-interval';

import { convertSecondsToOptions } from '../../Utils/utils';

import type { ServiceAlert } from '@linode/api-v4';

const mockServiceAlertMetadata: ServiceAlert = {
  evaluation_period_seconds: [60, 120, 300],
  polling_interval_seconds: [30, 60, 180],
  scope: ['region'],
};

const evaluationPeriodOptions =
  mockServiceAlertMetadata.evaluation_period_seconds.map((value) => ({
    label: convertSecondsToOptions(value),
    value,
  }));

const pollingIntervalOptions =
  mockServiceAlertMetadata.polling_interval_seconds.map((value) => ({
    label: convertSecondsToOptions(value),
    value,
  }));

describe('Trigger Conditions', () => {
  it('should render all the components and names', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions
          maxScrapingInterval={0}
          name="trigger_conditions"
          serviceMetadata={mockServiceAlertMetadata}
          serviceMetadataError={null}
          serviceMetadataLoading={false}
        />
      ),
    });
    expect(screen.getByLabelText('Evaluation Period')).toBeVisible();
    expect(screen.getByLabelText('Polling Interval')).toBeVisible();
    expect(
      screen.getByText('Trigger alert when all criteria are met for')
    ).toBeVisible();
    expect(screen.getByText('consecutive occurrence(s).')).toBeVisible();
  });

  it('should render the tooltips for the Autocomplete components', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions
          maxScrapingInterval={0}
          name="trigger_conditions"
          serviceMetadata={mockServiceAlertMetadata}
          serviceMetadataError={null}
          serviceMetadataLoading={false}
        />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });

    const evaluationPeriodContainer = screen.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodToolTip = within(evaluationPeriodContainer).getByRole(
      'button',
      {
        name: 'Defines the timeframe for collecting data in polling intervals to understand the service performance. Choose the data lookback period where the thresholds are applied to gather the information impactful for your business.',
      }
    );
    const pollingIntervalContainer = screen.getByTestId(PollingIntervalTestId);
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
    renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <TriggerConditions
          maxScrapingInterval={0}
          name="trigger_conditions"
          serviceMetadata={mockServiceAlertMetadata}
          serviceMetadataError={null}
          serviceMetadataLoading={false}
        />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });
    const evaluationPeriodContainer = screen.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodInput = within(evaluationPeriodContainer).getByRole(
      'button',
      { name: 'Open' }
    );

    await userEvent.click(evaluationPeriodInput);

    expect(
      await screen.findByRole('option', {
        name: evaluationPeriodOptions[1].label,
      })
    ).toBeVisible();
    expect(
      await screen.findByRole('option', {
        name: evaluationPeriodOptions[2].label,
      })
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole('option', {
        name: evaluationPeriodOptions[0].label,
      })
    );

    expect(
      within(evaluationPeriodContainer).getByRole('combobox')
    ).toHaveAttribute('value', evaluationPeriodOptions[0].label);
  });

  it('should render the Polling Interval component with options happy path and select an option', async () => {
    renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <TriggerConditions
          maxScrapingInterval={0}
          name="trigger_conditions"
          serviceMetadata={mockServiceAlertMetadata}
          serviceMetadataError={null}
          serviceMetadataLoading={false}
        />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });
    const pollingIntervalContainer = screen.getByTestId(PollingIntervalTestId);
    const pollingIntervalInput = within(pollingIntervalContainer).getByRole(
      'button',
      { name: 'Open' }
    );

    await userEvent.click(pollingIntervalInput);

    expect(
      await screen.findByRole('option', {
        name: pollingIntervalOptions[1].label,
      })
    ).toBeVisible();

    expect(
      await screen.findByRole('option', {
        name: pollingIntervalOptions[2].label,
      })
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole('option', {
        name: pollingIntervalOptions[0].label,
      })
    );
    expect(
      within(pollingIntervalContainer).getByRole('combobox')
    ).toHaveAttribute('value', pollingIntervalOptions[0].label);
  });

  it('should be able to show the options that are greater than or equal to max scraping Interval', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions
          maxScrapingInterval={120}
          name="trigger_conditions"
          serviceMetadata={mockServiceAlertMetadata}
          serviceMetadataError={null}
          serviceMetadataLoading={false}
        />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });
    const evaluationPeriodContainer = screen.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodInput = within(evaluationPeriodContainer).getByRole(
      'button',
      { name: 'Open' }
    );

    await userEvent.click(evaluationPeriodInput);

    expect(
      screen.queryByText(evaluationPeriodOptions[0].label)
    ).not.toBeInTheDocument();

    const pollingIntervalContainer = screen.getByTestId(PollingIntervalTestId);
    const pollingIntervalInput = within(pollingIntervalContainer).getByRole(
      'button',
      { name: 'Open' }
    );
    await userEvent.click(pollingIntervalInput);
    expect(
      screen.queryByText(pollingIntervalOptions[0].label)
    ).not.toBeInTheDocument();
  });
});
