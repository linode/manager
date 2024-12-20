import { Autocomplete, Box, TextField, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  EvaluationPeriodOptions,
  PollingIntervalOptions,
} from '../../constants';

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
      ? PollingIntervalOptions[serviceTypeWatcher]
      : [];
    return options.filter((item) => item.value >= maxScrapingInterval);
  };

  const getEvaluationPeriodOptions = () => {
    const options = serviceTypeWatcher
      ? EvaluationPeriodOptions[serviceTypeWatcher]
      : [];
    return options.filter((item) => item.value >= maxScrapingInterval);
  };

  return (
    <Box
      sx={(theme) => ({
        backgroundColor:
          theme.name === 'light' ? theme.color.grey5 : theme.color.grey9,
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
                  if (operation === 'selectOption') {
                    field.onChange(selected.value);
                  }
                  if (operation === 'clear') {
                    field.onChange(null);
                  }
                }}
                textFieldProps={{
                  labelTooltipText:
                    'Defines the timeframe for collecting data in polling intervals to understand the service performance. Choose the data lookback period where the thresholds are applied to gather the information impactful for your business.',
                }}
                value={
                  field.value !== null
                    ? getEvaluationPeriodOptions().find(
                        (option) => option.value === field.value
                      )
                    : null
                }
                data-testid="Evaluation-period"
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
        <Grid item md={2.5} sm={6} xs={12}>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                onChange={(
                  _,
                  newValue: { label: string; value: number },
                  operation
                ) => {
                  if (operation === 'selectOption') {
                    field.onChange(newValue.value);
                  }
                  if (operation === 'clear') {
                    field.onChange(null);
                  }
                }}
                textFieldProps={{
                  labelTooltipText:
                    'Choose how often you intend to evaulate the alert condition.',
                }}
                value={
                  field.value !== null
                    ? getPollingIntervalOptions().find(
                        (option) => option.value === field.value
                      )
                    : null
                }
                data-testid="Polling-interval"
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
        <Grid item marginTop={{ sm: 1, xs: 0 }} md="auto" sm={12} xs={12}>
          <Grid alignItems="flex-start" container>
            <Grid item md="auto" sm={6} xs={12}>
              <Box marginTop={{ md: 4 }}>
                <Typography
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    height: { sm: '56px', xs: '50px' },
                  }}
                  variant="body1"
                >
                  criteria are met for at least
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              md={3}
              sm="auto"
              sx={{ marginTop: { md: 2.5 }, paddingLeft: { md: 1 } }}
              xs="auto"
            >
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
                    data-testid="Trigger-occurences"
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
            </Grid>
            <Grid item md="auto" paddingLeft={{ md: 2.5 }} sm={12} xs={12}>
              <Box sx={{ marginTop: { md: 4, sx: 2 } }}>
                <Typography
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    height: { sm: '56px', xs: '50px' },
                  }}
                  variant="body1"
                >
                  consecutive occurences.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
