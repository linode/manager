import { capitalize } from '@linode/utilities';
import { screen } from '@testing-library/react';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { alertScopeLabelMap } from '../AlertsListing/constants';
import { processMetricCriteria } from '../Utils/utils';
import { AlertInformationActionRow } from './AlertInformationActionRow';

describe('Alert list table row', () => {
  it('Should display the data', () => {
    const alert = alertFactory.build();

    renderWithTheme(
      <AlertInformationActionRow
        alert={alert}
        handleToggle={vi.fn()}
        status={true}
      />
    );

    expect(screen.getByText(alert.label)).toBeVisible();
    expect(screen.getByText(capitalize(alert.type))).toBeVisible();
    expect(screen.getByText(alertScopeLabelMap[alert.scope])).toBeVisible();
  });

  it('Should display metric threshold', () => {
    const alert = alertFactory.build();
    const processCriteria = processMetricCriteria(alert.rule_criteria.rules)[0];
    const { getByText } = renderWithTheme(
      <AlertInformationActionRow
        alert={alert}
        handleToggle={vi.fn()}
        status={false}
      />
    );
    expect(
      getByText(
        `${processCriteria.label} ${processCriteria.metricOperator} ${processCriteria.threshold} ${processCriteria.unit}`
      )
    ).toBeInTheDocument();
  });

  it('Should have toggle button disabled if alert is region or account level and show tooltip', () => {
    const alert = alertFactory.build({
      scope: 'region',
    });
    renderWithTheme(
      <AlertInformationActionRow
        alert={alert}
        handleToggle={vi.fn()}
        status={true}
      />
    );

    expect(screen.getByRole('checkbox')).toHaveProperty('checked');
    expect(screen.getByRole('checkbox')).toBeDisabled();

    expect(
      screen.getByLabelText(
        "Region-level alerts can't be enabled or disabled for a single entity."
      )
    ).toBeVisible();
  });
});
