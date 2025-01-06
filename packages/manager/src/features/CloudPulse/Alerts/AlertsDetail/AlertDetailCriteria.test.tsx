import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { operators } from '../constants';
import { convertSecondsToMinutes } from '../Utils/utils';
import { AlertDetailCriteria } from './AlertDetailCriteria';

describe('AlertDetailCriteria component tests', () => {
  it('should render the alert detail criteria successfully on correct inputs', () => {
    const alert = alertFactory.build();
    const { getAllByText, getByText } = renderWithTheme(
      <AlertDetailCriteria alert={alert} />
    );
    const { rules } = alert.rule_criteria;
    expect(getAllByText('Metric Threshold:').length).toBe(rules.length);
    expect(getAllByText('Dimension Filter:').length).toBe(rules.length);
    expect(getByText('Criteria')).toBeInTheDocument();
    expect(getAllByText('Average').length).toBe(2);
    expect(getAllByText('CPU Usage').length).toBe(2);
    expect(getAllByText(operators['gt']).length).toBe(2);

    const {
      evaluation_period_seconds,
      polling_interval_seconds,
    } = alert.trigger_conditions;
    expect(
      getByText(convertSecondsToMinutes(polling_interval_seconds))
    ).toBeInTheDocument();
    expect(
      getByText(convertSecondsToMinutes(evaluation_period_seconds))
    ).toBeInTheDocument();
  });

  it('should render the alert detail criteria even if rules are empty', () => {
    const alert = alertFactory.build({
      rule_criteria: {
        rules: [],
      },
    });
    const { getByText } = renderWithTheme(
      <AlertDetailCriteria alert={alert} />
    );
    expect(getByText('Criteria')).toBeInTheDocument(); // empty criteria should be there
  });
});
