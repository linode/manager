import { Box, Button, Stack, Typography } from '@linode/ui';
import * as React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { useGetCloudPulseMetricDefinitionsByServiceType } from 'src/queries/cloudpulse/services';

import { convertToSeconds } from '../utilities';
import { Metric } from './Metric';

import type { CreateAlertDefinitionForm, MetricCriteriaForm } from '../types';
import type { AlertServiceType } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface MetricCriteriaProps {
  /*
   * boolean value to check if the component is in create mode
   */
  isCreateMode?: boolean;
  /**
   * name used for the component to set formik field
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, MetricCriteriaForm[]>;
  /**
   * serviceType used by the api to fetch the metric definitions
   */
  serviceType: AlertServiceType | null;
  /**
   * function used to pass the scrape interval value to the parent component
   * @param maxInterval number value that takes the maximum scrape interval from the list of selected metrics
   * @returns void
   */
  setMaxInterval: (maxInterval: number) => void;
}

export const MetricCriteriaField = (props: MetricCriteriaProps) => {
  const { isCreateMode, name, serviceType, setMaxInterval } = props;
  const {
    data: metricDefinitions,
    isError: isMetricDefinitionError,
    isLoading: isMetricDefinitionLoading,
  } = useGetCloudPulseMetricDefinitionsByServiceType(
    serviceType!,
    serviceType !== null,
    {},
    { is_alertable: true }
  );

  const { control } = useFormContext<CreateAlertDefinitionForm>();

  const metricCriteriaWatcher = useWatch({ control, name });

  const intervalList =
    metricDefinitions?.data
      .filter((item) =>
        metricCriteriaWatcher.some(
          (criteria: MetricCriteriaForm) => criteria.metric === item.metric
        )
      )
      .map((item) => item.scrape_interval) || [];

  const maxInterval = Math.max(...convertToSeconds(intervalList));

  React.useEffect(() => {
    setMaxInterval(maxInterval);
  }, [maxInterval, setMaxInterval]);

  const { append, fields, remove, replace } = useFieldArray({
    control,
    name,
  });
  const serviceWatcher = useWatch({ control, name: 'serviceType' });

  React.useEffect(() => {
    if (isCreateMode) {
      replace([
        {
          aggregate_function: null,
          dimension_filters: [],
          metric: null,
          operator: null,
          threshold: 0,
        },
      ]);
    }
  }, [isCreateMode, replace, serviceWatcher]);

  return (
    <Box sx={(theme) => ({ marginTop: theme.spacing(3) })}>
      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        sx={{ marginBottom: 1 }}
      >
        <Typography variant="h2">3. Criteria</Typography>
      </Box>
      <Stack spacing={2} sx={(theme) => ({ marginTop: theme.spacing(3) })}>
        {fields !== null &&
          fields.length !== 0 &&
          fields.map((field, index) => {
            return (
              <Metric
                data={metricDefinitions ? metricDefinitions.data : []}
                isMetricDefinitionError={isMetricDefinitionError}
                isMetricDefinitionLoading={isMetricDefinitionLoading}
                key={field.id}
                name={`rule_criteria.rules.${index}`}
                onMetricDelete={() => remove(index)}
                showDeleteIcon={fields.length > 1}
              />
            );
          })}
      </Stack>
      <Button
        onClick={() =>
          append({
            aggregate_function: null,
            dimension_filters: [],
            metric: null,
            operator: null,
            threshold: 0,
          })
        }
        buttonType="outlined"
        disabled={metricCriteriaWatcher.length === 5}
        size="medium"
        sx={(theme) => ({ marginTop: theme.spacing(2) })}
        sxEndIcon={{ display: 'none' }}
        tooltipText="You can add up to 5 metrics."
      >
        Add metric
      </Button>
    </Box>
  );
};
