import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { TriggerConditions } from './TriggerConditions';

import type { CreateAlertDefinitionForm } from '../types';

const EvaluationPeriodTestId = 'evaluation-period';

const PollingIntervalTestId = 'polling-interval';
const evaluationPeriodOptions = [
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
  { label: '1 hr', value: 3600 },
];
const pollingIntervalOptions = [
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
  { label: '1 hr', value: 3600 },
];

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

beforeEach(() => {
  queryMocks.useFlags.mockReturnValue({
    aclpAlertingTimeOptions: {
      evaluationPeriodOptions,
      pollingIntervalOptions,
    },
  });
});
describe('Trigger Conditions', () => {
  const user = userEvent.setup();

  it('should render all the components and names', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions maxScrapingInterval={0} name="trigger_conditions" />
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
        <TriggerConditions maxScrapingInterval={0} name="trigger_conditions" />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });

    const evaluationPeriodscreen = screen.getByTestId(EvaluationPeriodTestId);
    const evaluationPeriodToolTip = within(evaluationPeriodscreen).getByRole(
      'button',
      {
        name: 'Defines the timeframe for collecting data in polling intervals to understand the service performance. Choose the data lookback period where the thresholds are applied to gather the information impactful for your business.',
      }
    );
    const pollingIntervalscreen = screen.getByTestId(PollingIntervalTestId);
    const pollingIntervalToolTip = within(pollingIntervalscreen).getByRole(
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
        <TriggerConditions maxScrapingInterval={0} name="trigger_conditions" />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });
    const evaluationPeriodscreen = screen.getByTestId(EvaluationPeriodTestId);
    const evaluationPeriodInput = within(evaluationPeriodscreen).getByRole(
      'button',
      { name: 'Open' }
    );

    user.click(evaluationPeriodInput);

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

    await user.click(
      screen.getByRole('option', {
        name: evaluationPeriodOptions[0].label,
      })
    );

    expect(
      within(evaluationPeriodscreen).getByRole('combobox')
    ).toHaveAttribute('value', evaluationPeriodOptions[0].label);
  });

  it('should render the Polling Interval component with options happy path and select an option', async () => {
    renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <TriggerConditions maxScrapingInterval={0} name="trigger_conditions" />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });
    const pollingIntervalscreen = screen.getByTestId(PollingIntervalTestId);
    const pollingIntervalInput = within(pollingIntervalscreen).getByRole(
      'button',
      { name: 'Open' }
    );

    user.click(pollingIntervalInput);

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

    await user.click(
      screen.getByRole('option', {
        name: pollingIntervalOptions[0].label,
      })
    );
    expect(within(pollingIntervalscreen).getByRole('combobox')).toHaveAttribute(
      'value',
      pollingIntervalOptions[0].label
    );
  });

  it('should be able to show the options that are greater than or equal to max scraping Interval', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions
          maxScrapingInterval={400}
          name="trigger_conditions"
        />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });
    const evaluationPeriodscreen = screen.getByTestId(EvaluationPeriodTestId);
    const evaluationPeriodInput = within(evaluationPeriodscreen).getByRole(
      'button',
      { name: 'Open' }
    );

    await user.click(evaluationPeriodInput);

    expect(
      screen.queryByText(evaluationPeriodOptions[0].label)
    ).not.toBeInTheDocument();

    const pollingIntervalscreen = screen.getByTestId(PollingIntervalTestId);
    const pollingIntervalInput = within(pollingIntervalscreen).getByRole(
      'button',
      { name: 'Open' }
    );
    await user.click(pollingIntervalInput);
    expect(
      screen.queryByText(pollingIntervalOptions[0].label)
    ).not.toBeInTheDocument();
  });
});
