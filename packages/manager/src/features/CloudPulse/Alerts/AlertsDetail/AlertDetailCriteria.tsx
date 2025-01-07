import { Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { convertSecondsToMinutes } from '../Utils/utils';
import { AlertTypography, StyledAlertChip } from './AlertDetail';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';
import { RenderAlertMetricsAndDimensions } from './RenderAlertsMetricsAndDimensions';

import type { Alert } from '@linode/api-v4';

interface CriteriaProps {
  /*
   * The alert detail object for which the criteria needs to be displayed
   */
  alertDetails: Alert;
}

export const AlertDetailCriteria = React.memo((props: CriteriaProps) => {
  const { alertDetails } = props;
  const {
    evaluation_period_seconds: evaluationPeriod,
    polling_interval_seconds: pollingIntervalSeconds,
    trigger_occurrences: triggerOccurrences,
  } = alertDetails.trigger_conditions;
  const { rule_criteria: ruleCriteria = { rules: [] } } = alertDetails;
  const theme = useTheme();

  // Memoized trigger criteria rendering
  const renderTriggerCriteria = React.useMemo(
    () => (
      <>
        <Grid item sm={4} xs={12}>
          <AlertTypography fontFamily={theme.font.bold}>
            Trigger Alert When:
          </AlertTypography>
        </Grid>
        <Grid alignItems="center" container item md={8} xs={12}>
          <StyledAlertChip
            borderRadius={theme.spacing(0.3)}
            label="All"
            variant="outlined"
          />
          <AlertTypography marginRight={0.5}>
            criteria are met for
          </AlertTypography>
          <StyledAlertChip
            borderRadius={theme.spacing(0.3)}
            label={triggerOccurrences}
            variant="outlined"
          />
          <AlertTypography>consecutive occurrences.</AlertTypography>
        </Grid>
      </>
    ),
    [theme, triggerOccurrences]
  );
  return (
    <>
      <Typography marginBottom={2} variant="h2">
        Criteria
      </Typography>
      <Grid alignItems="center" container spacing={1}>
        <RenderAlertMetricsAndDimensions ruleCriteria={ruleCriteria} />
        <DisplayAlertDetailChips // label chip for polling interval
          label="Polling Interval"
          mergeChips
          values={[convertSecondsToMinutes(pollingIntervalSeconds)]}
        />
        <DisplayAlertDetailChips // label chip for evaluation period
          label="Evaluation Period"
          mergeChips
          values={[convertSecondsToMinutes(evaluationPeriod)]}
        />
        {renderTriggerCriteria} {/** Render the trigger criteria */}
      </Grid>
    </>
  );
});
