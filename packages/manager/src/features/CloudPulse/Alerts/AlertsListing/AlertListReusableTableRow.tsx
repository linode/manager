import { Box, Toggle, Tooltip, Typography } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { FormControlLabel } from '../../../../../../ui/src/components/FormControlLabel';
import { processMetricCriteria } from '../Utils/utils';

import type { ProcessedCriteria } from '../Utils/utils';
import type { Alert } from '@linode/api-v4';

interface AlertListReusableTableRowProps {
  alert: Alert;
  handleToggle: (alert: Alert) => void;
  status?: boolean;
}

export const AlertListReusableTableRow = (
  props: AlertListReusableTableRowProps
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
      <TableCell>{generateMetricThreshold(metricThreshold)}</TableCell>
      <TableCell>{type}</TableCell>
    </TableRow>
  );
};

const generateMetricThreshold = (metricThreshold: ProcessedCriteria[]) => {
  if (metricThreshold.length === 0) {
    return <></>;
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
      <Tooltip title={<Box sx={{ whiteSpace: 'pre-line' }}>{rest}</Box>}>
        <Typography
          sx={(theme) => {
            return {
              backgroundColor: theme.color.grey10,
              border: '1px solid',
              borderColors: theme.color.grey3,
              borderRadius: '4px',
              px: 1,
              py: 0.5,
            };
          }}
          variant="subtitle1"
        >
          +{total}
        </Typography>
      </Tooltip>
    </Box>
  );
};
