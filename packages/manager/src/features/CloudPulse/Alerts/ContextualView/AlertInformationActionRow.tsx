import { FormControlLabel, Toggle, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { processMetricCriteria } from '../Utils/utils';
import { MetricThreshold } from './MetricThreshold';

import type { Alert } from '@linode/api-v4';

interface AlertInformationActionRowProps {
  /**
   * Alert object which should be dispalyed in the row
   */
  alert: Alert;

  /**
   * Handler function for the click of toggle button
   * @param alert object for which toggle button is click
   */
  handleToggle: (alert: Alert) => void;

  /**
   * Status for the alert whether it is enabled or disabled
   */
  status?: boolean;
}

export const AlertInformationActionRow = (
  props: AlertInformationActionRowProps
) => {
  const { alert, handleToggle, status = false } = props;
  const { id, label, rule_criteria, service_type, type } = alert;
  const metricThreshold = processMetricCriteria(rule_criteria.rules);

  return (
    <TableRow data-qa-alert-cell={id} data-testid={id} key={`alert-row-${id}`}>
      <TableCell sx={{ width: 0 }}>
        <FormControlLabel
          control={
            <Toggle checked={status} onChange={() => handleToggle(alert)} />
          }
          label={''}
        />
      </TableCell>
      <TableCell>
        <Link to={`/alerts/definitions/detail/${service_type}/${id}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell>
        <MetricThreshold metricThreshold={metricThreshold} />
      </TableCell>
      <TableCell>
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Label.Regular.S,
          })}
        >
          {capitalize(type)}
        </Typography>
      </TableCell>
    </TableRow>
  );
};
