import {
  Box,
  Chip,
  FormControlLabel,
  Toggle,
  Tooltip,
  Typography,
} from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';
import NullComponent from 'src/components/NullComponent';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { processMetricCriteria } from '../Utils/utils';

import type { ProcessedCriteria } from '../Utils/utils';
import type { Alert } from '@linode/api-v4';

interface AlertInformationActionRowProps {
  /**
   * Alert object which should be dispalyed in the row
   */
  alert: Alert;

  /**
   * Handler function for the click of toggle button
   * @param alert alert object for which toggle button is click
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
      <TableCell>
        <FormControlLabel
          control={
            <Toggle checked={status} onChange={() => handleToggle(alert)} />
          }
          label={''}
        />
      </TableCell>
      <TableCell>
        <Link to={`/monitor/alerts/definitions/detail/${service_type}/${id}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell>
        <MetricThreshold metricThreshold={metricThreshold} />
      </TableCell>
      <TableCell>
        <Typography variant="subtitle1">{type}</Typography>
      </TableCell>
    </TableRow>
  );
};

export interface MetricThresholdProps {
  /**
   * List of processed criterias
   */
  metricThreshold: ProcessedCriteria[];
}

const MetricThreshold = (props: MetricThresholdProps) => {
  const { metricThreshold } = props;
  if (metricThreshold.length === 0) {
    return <NullComponent />;
  }

  const thresholdObject = metricThreshold[0];
  const metric = `${thresholdObject.label} ${thresholdObject.operator}  ${thresholdObject.threshold} ${thresholdObject.unit}`;
  const total = metricThreshold.length - 1;
  if (metricThreshold.length === 1) {
    return <Typography variant="subtitle1">{metric}</Typography>;
  }
  const rest = metricThreshold
    .slice(1)
    .map((criteria) => {
      return `${criteria.label} ${criteria.operator} ${criteria.threshold} ${criteria.unit}`;
    })
    .join('\n');
  return (
    <Box alignItems="center" display="flex" gap={1.75}>
      <Typography variant="subtitle1">{metric}</Typography>
      <Tooltip
        title={<Typography sx={{ whiteSpace: 'pre-line' }}>{rest}</Typography>}
      >
        <span>
          <Chip
            sx={(theme) => {
              return {
                backgroundColor: theme.bg.offWhite,
                border: '1px solid',
                borderColors: theme.borderColors.borderFocus,
                borderRadius: '4px',
                px: 0.5,
                py: 1.5,
              };
            }}
            label={`+${total}`}
          />
        </span>
      </Tooltip>
    </Box>
  );
};
