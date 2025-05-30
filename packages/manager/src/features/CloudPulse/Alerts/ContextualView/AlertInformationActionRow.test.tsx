import { capitalize } from '@linode/utilities';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { alertScopeLabelMap } from '../AlertsListing/constants';
import { processMetricCriteria } from '../Utils/utils';
import { AlertInformationActionRow } from './AlertInformationActionRow';

describe('Alert list table row', () => {
  it('Should display the data', () => {
    const alert = alertFactory.build();

    const { getByText } = renderWithTheme(
      <AlertInformationActionRow
        alert={alert}
        handleToggle={vi.fn()}
        status={true}
      />
    );

    expect(getByText(alert.label)).toBeInTheDocument();
    expect(getByText(capitalize(alert.type))).toBeInTheDocument();
    expect(getByText(alertScopeLabelMap[alert.scope])).toBeInTheDocument();
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
    const { getByRole } = renderWithTheme(
      <AlertInformationActionRow
        alert={alert}
        handleToggle={vi.fn()}
        isAlertActionRestricted={true}
        status={true}
      />
    );

    expect(getByRole('checkbox')).toHaveProperty('checked');
    expect(getByRole('checkbox')).toBeDisabled();

    const tooltipIcon = document.querySelector('[data-qa-help-tooltip="true"]');
    expect(tooltipIcon).toHaveAttribute(
      'aria-label',
      "Region-level alerts can't be enabled or disabled for a single entity."
    );
  });
});
