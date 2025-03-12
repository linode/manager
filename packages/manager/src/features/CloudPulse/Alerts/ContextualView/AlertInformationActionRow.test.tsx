import { capitalize } from '@linode/utilities';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

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

  it('Should have toggle button disabled', () => {
    const alert = alertFactory.build();
    const { getByRole } = renderWithTheme(
      <AlertInformationActionRow
        alert={alert}
        handleToggle={vi.fn()}
        status={true}
      />
    );

    expect(getByRole('checkbox')).toHaveProperty('checked');
  });
});
