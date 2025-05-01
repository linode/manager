import React from 'react';

import {
  alertDimensionsFactory,
  alertFactory,
  alertRulesFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { metricOperatorTypeMap } from '../constants';
import { convertSecondsToMinutes } from '../Utils/utils';
import { AlertDetailCriteria } from './AlertDetailCriteria';

describe('AlertDetailCriteria component tests', () => {
  it('should render the alert detail criteria successfully on correct inputs', () => {
    const alertDetails = alertFactory.build({
      rule_criteria: {
        rules: alertRulesFactory.buildList(2, {
          aggregate_function: 'avg',
          dimension_filters: alertDimensionsFactory.buildList(2),
          label: 'CPU Usage',
          metric: 'cpu_usage',
          operator: 'gt',
          unit: 'bytes',
        }),
      },
    });
    const { getAllByText, getByText } = renderWithTheme(
      <AlertDetailCriteria alertDetails={alertDetails} />
    );
    const { rules } = alertDetails.rule_criteria;
    expect(getAllByText('Metric Threshold:').length).toBe(rules.length);
    expect(getAllByText('Dimension Filter:').length).toBe(rules.length);
    expect(getByText('Criteria')).toBeInTheDocument();
    expect(getAllByText('Average').length).toBe(2);
    expect(getAllByText('CPU Usage').length).toBe(2);
    expect(getAllByText('bytes').length).toBe(2);
    expect(getAllByText(metricOperatorTypeMap['gt']).length).toBe(2);
    const { evaluation_period_seconds, polling_interval_seconds } =
      alertDetails.trigger_conditions;
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
    const { getByText, queryByText } = renderWithTheme(
      <AlertDetailCriteria alertDetails={alert} />
    );
    expect(getByText('Criteria')).toBeInTheDocument(); // empty criteria should be there
    expect(queryByText('Metric Threshold:')).not.toBeInTheDocument();
    expect(queryByText('Dimension Filter:')).not.toBeInTheDocument();
  });
});
