import { Autocomplete, Box } from '@linode/ui';
import { Stack, TextField, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import {
  MetricAggregationOptions,
  MetricOperatorOptions,
} from '../../constants';
import { StyledDeleteIcon } from '../utilities';

import type { Item } from '../../constants';
import type { CreateAlertDefinitionForm, MetricCriteriaForm } from '../types';
import type {
  AvailableMetrics,
  MetricAggregationType,
  MetricOperatorType,
  MetricUnitType,
} from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface MetricCriteriaProps {
  /**
   * apiErrors while accessing the metric definitions endpoint
   */
  apiError: boolean[];
  /**
   * metric data fetched by the metric definitions endpoint
   */
  data: AvailableMetrics[];
  /**
   * name (with the index) used for the component to set in form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, MetricCriteriaForm>;
  /**
   * function to delete the Metric component
   * @returns void
   */
  onMetricDelete: () => void;
  /**
   * to control when to show the delete icon
   */
  showDeleteIcon: boolean;
}
export const Metric = (props: MetricCriteriaProps) => {
  const { apiError, data, name, onMetricDelete, showDeleteIcon } = props;
  const [isMetricDefinitionError, isMetricDefinitionLoading] = apiError;
  const {
    control,
    setValue,
    watch,
  } = useFormContext<CreateAlertDefinitionForm>();

  const handleDataFieldChange = (
    selected: { label: string; unit: MetricUnitType; value: string },
    operation: string
  ) => {
    const fieldValue: MetricCriteriaForm = {
      aggregation_type: null,
      dimension_filters: [],
      metric: null,
      operator: null,
      threshold: 0,
    };
    if (operation === 'selectOption') {
      setValue(name, {
        ...fieldValue,
        metric: selected.value,
      });
    }
    if (operation === 'clear') {
      setValue(name, fieldValue);
    }
  };

  const metricOptions = React.useMemo(() => {
    return data
      ? data.map((metric) => ({
          label: metric.label,
          value: metric.metric,
        }))
      : [];
  }, [data]);

  const metricWatcher = watch(`${name}.metric`);

  const selectedMetric = React.useMemo(() => {
    return data && metricWatcher
      ? data.find((metric) => metric.metric === metricWatcher)
      : null;
  }, [data, metricWatcher]);

  const unit = selectedMetric?.unit ?? null;
  const aggOptions = React.useMemo((): Item<
    string,
    MetricAggregationType
  >[] => {
    return selectedMetric && selectedMetric.available_aggregate_functions
      ? MetricAggregationOptions.filter((option) =>
          selectedMetric.available_aggregate_functions.includes(option.value)
        )
      : [];
  }, [selectedMetric]);

  return (
    <Box
      sx={(theme) => ({
        backgroundColor:
          theme.name === 'light' ? theme.color.grey5 : theme.color.grey9,
        borderRadius: 1,
        p: 2,
      })}
      data-testid={`${name}-id`}
    >
      <Stack>
        <Box display={'flex'} justifyContent="space-between">
          <Typography variant={'h3'}>Metric Threshold</Typography>
          <Box>
            {showDeleteIcon && (
              <StyledDeleteIcon
                data-testid={`${name}-delete-icon`}
                onClick={onMetricDelete}
              />
            )}
          </Box>
        </Box>
        <Grid alignItems="flex-start" container spacing={2}>
          <Grid item md={3} sm={6} xs={12}>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  errorText={
                    fieldState.error?.message ??
                    (isMetricDefinitionError
                      ? 'Error in fetching the data.'
                      : '')
                  }
                  onChange={(
                    _,
                    newValue: {
                      label: string;
                      unit: MetricUnitType;
                      value: string;
                    },
                    reason
                  ) => {
                    handleDataFieldChange(newValue, reason);
                  }}
                  textFieldProps={{
                    labelTooltipText:
                      'Represents the metric you want to receive alerts for. Choose the one that helps you evaluate performance of your service in the most efficient way.',
                  }}
                  value={
                    field.value !== null
                      ? metricOptions.find(
                          (option) => option.value === field.value
                        )
                      : null
                  }
                  data-testid={'Data-field'}
                  disabled={!watch('serviceType')}
                  label="Data Field"
                  loading={isMetricDefinitionLoading}
                  onBlur={field.onBlur}
                  options={metricOptions}
                  placeholder="Select a Data field"
                  size="medium"
                />
              )}
              control={control}
              name={`${name}.metric`}
            />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  onChange={(
                    _,
                    newValue: { label: string; value: MetricAggregationType },
                    operation
                  ) => {
                    if (operation === 'selectOption') {
                      field.onChange(newValue.value);
                    }
                    if (operation === 'clear') {
                      field.onChange(null);
                    }
                  }}
                  value={
                    field.value !== null
                      ? aggOptions.find(
                          (option) => option.value === field.value
                        )
                      : null
                  }
                  data-testid={'Aggregation-type'}
                  disabled={aggOptions.length === 0}
                  errorText={fieldState.error?.message}
                  key={metricWatcher}
                  label="Aggregation Type"
                  onBlur={field.onBlur}
                  options={aggOptions}
                  placeholder="Select an Aggregation type"
                  sx={{ paddingTop: { sm: 1, xs: 0 } }}
                />
              )}
              control={control}
              name={`${name}.aggregation_type`}
            />
          </Grid>
          <Grid item md={2} sm={6} xs={12}>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  onChange={(
                    _,
                    selected: { label: string; value: MetricOperatorType },
                    operation
                  ) => {
                    if (operation === 'selectOption') {
                      field.onChange(selected.value);
                    }
                    if (operation === 'clear') {
                      field.onChange(null);
                    }
                  }}
                  value={
                    field.value !== null
                      ? MetricOperatorOptions.find(
                          (option) => option.value === field.value
                        )
                      : null
                  }
                  data-testid={'Operator'}
                  errorText={fieldState.error?.message}
                  key={metricWatcher}
                  label={'Operator'}
                  onBlur={field.onBlur}
                  options={MetricOperatorOptions}
                  placeholder="Select an operator"
                  sx={{ paddingTop: { sm: 1, xs: 0 } }}
                />
              )}
              control={control}
              name={`${name}.operator`}
            />
          </Grid>
          <Grid item marginTop={{ sm: 1, xs: 0 }} md={3} sm={6} xs={12}>
            <Grid alignItems="flex-start" container spacing={2}>
              <Grid item md={6} sm={6} xs={6}>
                <Controller
                  render={({ field, fieldState }) => (
                    <TextField
                      onWheel={(event: React.SyntheticEvent<Element, Event>) =>
                        event.target instanceof HTMLElement &&
                        event.target.blur()
                      }
                      data-testid="threshold"
                      errorText={fieldState.error?.message}
                      label="Threshold"
                      min={0}
                      name={`${name}.threshold`}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.value)}
                      type="number"
                      value={field.value ?? 0}
                    />
                  )}
                  control={control}
                  name={`${name}.threshold`}
                />
              </Grid>
              <Grid item marginTop={1.75} md={6} sm={6} xs={6}>
                <Typography
                  sx={{
                    alignItems: 'flex-end',
                    display: 'flex',
                    height: '56px',
                  }}
                  variant="body1"
                >
                  {unit}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};
