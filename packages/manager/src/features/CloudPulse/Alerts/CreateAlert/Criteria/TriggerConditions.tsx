import { Autocomplete, Box, TextField, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  evaluationPeriodOptions,
  pollingIntervalOptions,
} from '../../constants';
import { getAlertBoxStyles } from '../../Utils/utils';

import type { CreateAlertDefinitionForm } from '../types';
import type {
  CreateAlertDefinitionPayload,
  TriggerCondition,
} from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';
interface TriggerConditionProps {
  /**
   * maximum scraping interval value for a metric to filter the evaluation period and polling interval options
   */
  maxScrapingInterval: number;
  /**
   * name used for the component to set in form
   */
  name: FieldPathByValue<CreateAlertDefinitionPayload, TriggerCondition>;
}
export const TriggerConditions = (props: TriggerConditionProps) => {
  const { maxScrapingInterval, name } = props;

  const { control } = useFormContext<CreateAlertDefinitionForm>();
  const serviceTypeWatcher = useWatch({
    control,
    name: 'serviceType',
  });
  const getPollingIntervalOptions = () => {
    const options = serviceTypeWatcher
      ? pollingIntervalOptions[serviceTypeWatcher]
      : [];
    return options.filter((item) => item.value >= maxScrapingInterval);
  };

  const getEvaluationPeriodOptions = () => {
    const options = serviceTypeWatcher
      ? evaluationPeriodOptions[serviceTypeWatcher]
      : [];
    return options.filter((item) => item.value >= maxScrapingInterval);
  };

  return (
    <Box
      sx={(theme) => ({
        ...getAlertBoxStyles(theme),
        borderRadius: 1,
        marginTop: theme.spacing(2),
        p: 2,
      })}
    >
      <Typography variant="h3"> Trigger Conditions</Typography>
      <Grid alignItems="flex-start" container spacing={2}>
        <Grid item md={3} sm={6} xs={12}>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                onChange={(
                  _,
                  selected: { label: string; value: number },
                  operation
                ) => {
                  field.onChange(
                    operation === 'selectOption' ? selected.value : null
                  );
                }}
                textFieldProps={{
                  labelTooltipText:
                    'Choose how often you intend to evaluate the alert condition.',
                }}
                value={
                  getEvaluationPeriodOptions().find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                data-testid="evaluation-period"
                disabled={!serviceTypeWatcher}
                errorText={fieldState.error?.message}
                label="Evaluation Period"
                onBlur={field.onBlur}
                options={getEvaluationPeriodOptions()}
                placeholder="Select an Evaluation period"
              />
            )}
            control={control}
            name={`${name}.evaluation_period_seconds`}
          />
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                onChange={(
                  _,
                  newValue: { label: string; value: number },
                  operation
                ) => {
                  field.onChange(
                    operation === 'selectOption' ? newValue.value : null
                  );
                }}
                textFieldProps={{
                  labelTooltipText:
                    'Defines the timeframe for collecting data in polling intervals to understand the service performance. Choose the data lookback period where the thresholds are applied to gather the information impactful for your business.',
                }}
                value={
                  getPollingIntervalOptions().find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                data-testid="polling-interval"
                disabled={!serviceTypeWatcher}
                errorText={fieldState.error?.message}
                label="Polling Interval"
                onBlur={field.onBlur}
                options={getPollingIntervalOptions()}
                placeholder="Select a Polling"
              />
            )}
            control={control}
            name={`${name}.polling_interval_seconds`}
          />
        </Grid>
        <Grid
          alignItems="center"
          display="flex"
          gap={1}
          item
          md="auto"
          mt={{ lg: 3.5, xs: 0 }}
          sm={12}
          xs={12}
        >
          <Typography mt={3} variant="body1">
            Trigger alert when all criteria are met for
          </Typography>

          <Controller
            render={({ field, fieldState }) => (
              <TextField
                onWheel={(event) =>
                  event.target instanceof HTMLElement && event.target.blur()
                }
                sx={{
                  height: '30px',
                  width: '30px',
                }}
                data-testid="trigger-occurences"
                errorText={fieldState.error?.message}
                label=""
                min={0}
                name={`${name}.trigger_occurrences`}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.value)}
                type="number"
                value={field.value ?? 0}
              />
            )}
            control={control}
            name={`${name}.trigger_occurrences`}
          />

          <Typography mt={3} textAlign="start" variant="body1">
            consecutive occurrence(s).
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
