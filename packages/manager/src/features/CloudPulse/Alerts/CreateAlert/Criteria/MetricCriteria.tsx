import { Button, Stack, Typography } from '@linode/ui';
import * as React from 'react';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { useGetCloudPulseMetricDefinitionsByServiceType } from 'src/queries/cloudpulse/services';

import { MULTILINE_ERROR_SEPARATOR } from '../../constants';
import { AlertListNoticeMessages } from '../../Utils/AlertListNoticeMessages';
import { convertToSeconds } from '../utilities';
import { Metric } from './Metric';

import type { CreateAlertDefinitionForm, MetricCriteriaForm } from '../types';
import type { AlertServiceType } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface MetricCriteriaProps {
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
  const { name, serviceType, setMaxInterval } = props;
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

  const { append, fields, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <Controller
      render={({ fieldState, formState }) => (
        <Stack mt={3} spacing={2}>
          <Typography variant="h2">3. Criteria</Typography>
          {formState.isSubmitted &&
            fieldState.error &&
            fieldState.error.message?.length && (
              <AlertListNoticeMessages
                errorMessage={fieldState.error.message}
                separator={MULTILINE_ERROR_SEPARATOR}
                variant="error"
              />
            )}
          <Stack spacing={2}>
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
            sx={{
              width: '130px',
            }}
            buttonType="outlined"
            disabled={metricCriteriaWatcher.length === 5}
            size="medium"
            tooltipText="You can add up to 5 metrics."
          >
            Add metric
          </Button>
        </Stack>
      )}
      control={control}
      name={name}
    />
  );
};
