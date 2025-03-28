import { Autocomplete, Box } from '@linode/ui';
import { TextField, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  metricAggregationOptions,
  metricOperatorOptions,
} from '../../constants';
import { getAlertBoxStyles } from '../../Utils/utils';
import { ClearIconButton } from './ClearIconButton';
import { DimensionFilters } from './DimensionFilter';

import type { Item } from '../../constants';
import type { CreateAlertDefinitionForm, MetricCriteriaForm } from '../types';
import type {
  MetricAggregationType,
  MetricDefinition,
  MetricOperatorType,
} from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface MetricCriteriaProps {
  /**
   * metric data fetched by the metric definitions endpoint
   */
  data: MetricDefinition[];
  /**
   * variable to check for metric definitions api call error state
   */
  isMetricDefinitionError: boolean;
  /**
   * variable to check for metric definitions api call loading state
   */
  isMetricDefinitionLoading: boolean;
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
  const {
    data,
    isMetricDefinitionError,
    isMetricDefinitionLoading,
    name,
    onMetricDelete,
    showDeleteIcon,
  } = props;
  const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();

  const handleDataFieldChange = (
    selected: { label: string; value: string },
    operation: string
  ) => {
    const fieldValue: MetricCriteriaForm = {
      aggregate_function: null,
      dimension_filters: [],
      metric: null,
      operator: null,
      threshold: 0,
    };
    if (operation === 'selectOption') {
      setValue(`${name}.metric`, selected.value, { shouldValidate: true });
      setValue(`${name}.aggregate_function`, fieldValue.aggregate_function);
      setValue(`${name}.dimension_filters`, fieldValue.dimension_filters);
      setValue(`${name}.operator`, fieldValue.operator);
      setValue(`${name}.threshold`, fieldValue.threshold);
    } else {
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

  const metricWatcher = useWatch({ control, name: `${name}.metric` });

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
      ? metricAggregationOptions.filter((option) =>
          selectedMetric.available_aggregate_functions.includes(option.value)
        )
      : [];
  }, [selectedMetric]);

  const serviceWatcher = useWatch({ control, name: 'serviceType' });
  return (
    <Box
      sx={(theme) => ({
        ...getAlertBoxStyles(theme),
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
      })}
      data-testid={`${name}-id`}
    >
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h3">Metric Threshold</Typography>
          {showDeleteIcon && <ClearIconButton handleClick={onMetricDelete} />}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }}>
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
                      value: string;
                    },
                    reason
                  ) => {
                    handleDataFieldChange(newValue, reason);
                  }}
                  textFieldProps={{
                    labelTooltipText:
                      'Represents the metric you want to receive alerts for. Choose the one that helps you evaluate performance of your service in the most efficient way. For multiple metrics we use the AND method by default.',
                  }}
                  value={
                    metricOptions.find(
                      (option) => option.value === field.value
                    ) ?? null
                  }
                  data-qa-metric-threshold={`${name}-data-field`}
                  data-testid="data-field"
                  disabled={!serviceWatcher}
                  label="Data Field"
                  loading={isMetricDefinitionLoading}
                  noMarginTop
                  onBlur={field.onBlur}
                  options={metricOptions}
                  placeholder="Select a Data Field"
                  size="medium"
                />
              )}
              control={control}
              name={`${name}.metric`}
            />
          </Grid>
          <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }}>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  onChange={(
                    _,
                    newValue: { label: string; value: MetricAggregationType },
                    operation
                  ) => {
                    field.onChange(
                      operation === 'selectOption' ? newValue.value : null
                    );
                  }}
                  value={
                    aggOptions.find((option) => option.value === field.value) ??
                    null
                  }
                  data-qa-metric-threshold={`${name}-aggregation-type`}
                  data-testid="aggregation-type"
                  disabled={aggOptions.length === 0}
                  errorText={fieldState.error?.message}
                  key={metricWatcher}
                  label="Aggregation Type"
                  noMarginTop
                  onBlur={field.onBlur}
                  options={aggOptions}
                  placeholder="Select an Aggregation Type"
                  sx={{ paddingTop: { sm: 1, xs: 0 } }}
                />
              )}
              control={control}
              name={`${name}.aggregate_function`}
            />
          </Grid>
          <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }}>
            <Controller
              render={({ field, fieldState }) => (
                <Autocomplete
                  onChange={(
                    _,
                    selected: { label: string; value: MetricOperatorType },
                    operation
                  ) => {
                    field.onChange(
                      operation === 'selectOption' ? selected.value : null
                    );
                  }}
                  value={
                    field.value !== null
                      ? metricOperatorOptions.find(
                          (option) => option.value === field.value
                        )
                      : null
                  }
                  data-qa-metric-threshold={`${name}-operator`}
                  data-testid="operator"
                  disabled={!metricWatcher}
                  errorText={fieldState.error?.message}
                  key={metricWatcher}
                  label="Operator"
                  noMarginTop
                  onBlur={field.onBlur}
                  options={metricOperatorOptions}
                  placeholder="Select an Operator"
                  sx={{ paddingTop: { sm: 1, xs: 0 } }}
                />
              )}
              control={control}
              name={`${name}.operator`}
            />
          </Grid>
          <Grid size={{ lg: 3, md: 2, sm: 6, xs: 12 }}>
            <Box display="flex" gap={1}>
              <Controller
                render={({ field, fieldState }) => (
                  <TextField
                    containerProps={{
                      sx: { paddingTop: 1 },
                    }}
                    onWheel={(event: React.SyntheticEvent<Element, Event>) =>
                      event.target instanceof HTMLElement && event.target.blur()
                    }
                    sx={{
                      height: '34px',
                    }}
                    data-qa-metric-threshold={`${name}-threshold`}
                    data-qa-threshold="threshold"
                    data-testid="threshold"
                    errorText={fieldState.error?.message}
                    label="Threshold"
                    min={0}
                    name={`${name}.threshold`}
                    noMarginTop
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value)}
                    type="number"
                    value={field.value ?? 0}
                  />
                )}
                control={control}
                name={`${name}.threshold`}
              />
              <Typography
                sx={{
                  alignItems: 'flex-end',
                  display: 'flex',
                  height: '56px',
                  marginTop: { lg: '5px', md: '5px', sm: '5px' },
                }}
                variant="body1"
              >
                {/* There are discussions going on with the UX and within the team about the
                 * units being outside of the TextField or inside as an adornments
                 */}
                {unit}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <DimensionFilters
        dataFieldDisabled={metricWatcher === null}
        dimensionOptions={selectedMetric?.dimensions ?? []}
        key={metricWatcher}
        name={`${name}.dimension_filters`}
      />
    </Box>
  );
};
