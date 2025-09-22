import { yupResolver } from '@hookform/resolvers/yup';
import { ActionsPanel, Box, Button, Stack } from '@linode/ui';
import React from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';

import { CloudPulseDimensionFilterFields } from './CloudPulseDimensionFilterFields';
import { metricDimensionFiltersSchema } from './schema';

import type {
  MetricsDimensionFilter,
  MetricsDimensionFilterForm,
} from './types';
import type { Dimension } from '@linode/api-v4';

interface CloudPulseDimensionFilterRendererProps {
  /**
   * The clear all trigger to reset the form
   */
  clearAllTrigger: number;

  /**
   * The boolean value to disable the Data Field in dimension filter
   */
  dataFieldDisabled: boolean;

  /**
   * The list of dimensions associated with the selected metric
   */
  dimensionOptions: Dimension[];
  /**
   * Callback fired to close the drawer
   */
  onClose: () => void;
  /**
   * Callback fired on form submission
   * @param data The form data on submission
   */
  onSubmit: (data: MetricsDimensionFilterForm) => void;
  /**
   * The selected dimension filters for the metric
   */
  selectedDimensions?: MetricsDimensionFilter[];
  /**
   * The selected entities for the dimension filter
   */
  selectedEntities?: string[];
}
export const CloudPulseDimensionFilterRenderer = (
  props: CloudPulseDimensionFilterRendererProps
) => {
  const {
    dataFieldDisabled,
    dimensionOptions,
    selectedEntities = [],
    selectedDimensions,
    onSubmit,
    clearAllTrigger,
    onClose,
  } = props;

  const formMethods = useForm<MetricsDimensionFilterForm>({
    defaultValues: {
      dimension_filters:
        selectedDimensions && selectedDimensions?.length
          ? selectedDimensions
          : [
              {
                dimension_label: null,
                operator: null,
                value: null,
              },
            ],
    },
    mode: 'onBlur',
    resolver: yupResolver(metricDimensionFiltersSchema),
  });
  const { control, handleSubmit, reset } = formMethods;

  const formRef = React.useRef<HTMLFormElement>(null);
  const handleFormSubmit = handleSubmit(async (values) => {
    values.dimension_filters = values.dimension_filters.filter(
      ({ dimension_label: dimensionLabel, operator, value }) =>
        dimensionLabel && operator && value
    );
    onSubmit({
      dimension_filters: dimensionFilterWatcher,
    });
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'dimension_filters',
  });

  const dimensionFilterWatcher = useWatch({
    control,
    name: 'dimension_filters',
  });

  React.useEffect(() => {
    // set a single empty filter (same shape as your default)
    if (clearAllTrigger > 0) {
      reset({
        dimension_filters: [
          { dimension_label: null, operator: null, value: null },
        ],
      });
    }
  }, [clearAllTrigger, reset]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleFormSubmit} ref={formRef}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Stack gap={1}>
            {fields?.length > 0 &&
              fields.map((field, index) => (
                <CloudPulseDimensionFilterFields
                  dataFieldDisabled={dataFieldDisabled}
                  dimensionOptions={dimensionOptions}
                  key={field.id}
                  name={`dimension_filters.${index}`}
                  onFilterDelete={() => remove(index)}
                  selectedEntities={selectedEntities}
                />
              ))}
          </Stack>
          <Button
            compactX
            data-qa-buttons="true"
            disabled={
              dimensionFilterWatcher && dimensionFilterWatcher.length === 5
            }
            onClick={() =>
              append({
                dimension_label: null,
                operator: null,
                value: null,
              })
            }
            size="small"
            sx={{ justifyContent: 'start', width: '160px' }}
            tooltipText="You can add up to 5 dimension filters."
          >
            Add Filter
          </Button>
        </Box>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Apply',
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: () => {
              onClose();
            },
          }}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        />
      </form>
    </FormProvider>
  );
};
