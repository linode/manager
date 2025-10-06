import { Typography } from '@linode/ui';
import { GridLegacy, useTheme } from '@mui/material';
import React from 'react';

import { convertSecondsToOptions } from '../Utils/utils';
import { StyledAlertChip, StyledAlertTypography } from './AlertDetail';
import { DisplayAlertDetailChips } from './DisplayAlertDetailChips';
import { RenderAlertMetricsAndDimensions } from './RenderAlertsMetricsAndDimensions';

import type { Alert, CloudPulseServiceType } from '@linode/api-v4';

interface CriteriaProps {
  /**
   * The alert detail object for which the criteria needs to be displayed
   */
  alertDetails: Alert;
  /**
   * The service type of the alert for which the criteria needs to be displayed
   */
  serviceType: CloudPulseServiceType;
}

export const AlertDetailCriteria = React.memo((props: CriteriaProps) => {
  const { alertDetails, serviceType } = props;
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
        <GridLegacy item sm={4} xs={12}>
          <StyledAlertTypography
            data-qa-item="Trigger Alert When"
            sx={{ font: theme.font.bold }}
          >
            Trigger Alert When:
          </StyledAlertTypography>
        </GridLegacy>
        <GridLegacy
          container
          item
          md={8}
          sx={{
            alignItems: 'center',
          }}
          xs={12}
        >
          <StyledAlertChip
            borderRadius={theme.spacing(0.3)}
            data-qa-chip="All"
            label="All"
            variant="outlined"
          />
          <StyledAlertTypography
            data-qa-item="criteria are met for"
            marginRight={0.5}
          >
            criteria are met for
          </StyledAlertTypography>
          <StyledAlertChip
            borderRadius={theme.spacing(0.3)}
            data-qa-chip={triggerOccurrences}
            label={triggerOccurrences}
            variant="outlined"
          />
          <StyledAlertTypography data-qa-item="consecutive occurrences">
            consecutive occurrences.
          </StyledAlertTypography>
        </GridLegacy>
      </>
    ),
    [theme, triggerOccurrences]
  );
  return (
    <>
      <Typography marginBottom={2} variant="h2">
        Criteria
      </Typography>
      <GridLegacy
        container
        spacing={1}
        sx={{
          alignItems: 'center',
        }}
      >
        <RenderAlertMetricsAndDimensions
          ruleCriteria={ruleCriteria}
          serviceType={serviceType}
        />
        <DisplayAlertDetailChips // label chip for polling interval
          label="Polling Interval"
          mergeChips
          values={[convertSecondsToOptions(pollingIntervalSeconds)]}
        />
        <DisplayAlertDetailChips // label chip for evaluation period
          label="Evaluation Period"
          mergeChips
          values={[convertSecondsToOptions(evaluationPeriod)]}
        />
        {renderTriggerCriteria} {/** Render the trigger criteria */}
      </GridLegacy>
    </>
  );
});
