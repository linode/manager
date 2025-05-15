import { Autocomplete, Box, TextField, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

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
      <Grid
        container
        spacing={2}
        sx={{
          alignItems: 'flex-start',
        }}
      >
        <Grid item md={3} sm={6} xs={12}>
          <Controller
            control={control}
            name={`${name}.evaluation_period_seconds`}
            render={({ field, fieldState }) => (
              <Autocomplete
                data-testid="evaluation-period"
                disabled={!serviceTypeWatcher}
                errorText={fieldState.error?.message}
                label="Evaluation Period"
                onBlur={field.onBlur}
                onChange={(
                  _,
                  selected: { label: string; value: number },
                  operation
                ) => {
                  field.onChange(
                    operation === 'selectOption' ? selected.value : null
                  );
                }}
                options={getEvaluationPeriodOptions()}
                placeholder="Select an Evaluation period"
                textFieldProps={{
                  labelTooltipText:
                    'Defines the timeframe for collecting data in polling intervals to understand the service performance. Choose the data lookback period where the thresholds are applied to gather the information impactful for your business.',
                }}
                value={
                  getEvaluationPeriodOptions().find(
                    (option) => option.value === field.value
                  ) ?? null
                }
              />
            )}
          />
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Controller
            control={control}
            name={`${name}.polling_interval_seconds`}
            render={({ field, fieldState }) => (
              <Autocomplete
                data-testid="polling-interval"
                disabled={!serviceTypeWatcher}
                errorText={fieldState.error?.message}
                label="Polling Interval"
                onBlur={field.onBlur}
                onChange={(
                  _,
                  newValue: { label: string; value: number },
                  operation
                ) => {
                  field.onChange(
                    operation === 'selectOption' ? newValue.value : null
                  );
                }}
                options={getPollingIntervalOptions()}
                placeholder="Select a Polling Interval"
                textFieldProps={{
                  labelTooltipText:
                    'Choose how often you intend to evaluate the alert condition.',
                }}
                value={
                  getPollingIntervalOptions().find(
                    (option) => option.value === field.value
                  ) ?? null
                }
              />
            )}
          />
        </Grid>
        <Grid
          alignItems="start"
          display="flex"
          flexDirection={{ sm: 'row', xs: 'column' }}
          gap={1}
          item
          justifyContent={{ sm: 'left', xs: 'center' }}
          md="auto"
          sm={12}
          sx={{
            mt: { lg: 3.5, xs: 0 },
          }}
          xs={12}
        >
          <Typography
            marginTop={{ sm: '32px', xs: '0px' }}
            maxWidth={{ lg: '270px', md: '220px' }}
            mt={3}
            variant="body1"
          >
            Trigger alert when all criteria are met for
          </Typography>

          <Controller
            control={control}
            name={`${name}.trigger_occurrences`}
            render={({ field, fieldState }) => (
              <TextField
                containerProps={{
                  maxWidth: '120px',
                }}
                data-qa-trigger-occurrences
                data-testid="trigger-occurences"
                disabled={!serviceTypeWatcher}
                errorText={fieldState.error?.message}
                label=""
                max={Number.MAX_SAFE_INTEGER}
                min={0}
                name={`${name}.trigger_occurrences`}
                noMarginTop
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.value)}
                onWheel={(event) =>
                  event.target instanceof HTMLElement && event.target.blur()
                }
                sx={{
                  height: '34px',
                  marginTop: { sm: '16px', xs: '0px' },
                  width: '100px',
                }}
                type="number"
                value={field.value ?? 0}
              />
            )}
          />

          <Typography
            marginTop={{ sm: '32px', xs: '0px' }}
            mt={3}
            textAlign="start"
            variant="body1"
          >
            consecutive occurrence(s).
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
