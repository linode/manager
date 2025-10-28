import { yupResolver } from '@hookform/resolvers/yup';
import { ActionsPanel, Box, Button, Divider, Stack } from '@linode/ui';
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
import type { CloudPulseServiceType, Dimension } from '@linode/api-v4';

interface CloudPulseDimensionFilterRendererProps {
  /**
   * The clear all trigger to reset the form
   */
  clearAllTrigger: number;

  /**
   * The list of dimensions associated with the selected metric
   */
  dimensionOptions: Dimension[];
  /**
   * Callback triggered to close the drawer
   */
  onClose: () => void;

  /**
   * Callback to publish any change in form
   * @param isDirty indicated the changes
   */
  onDimensionChange: (isDirty: boolean) => void;
  /**
   * Callback triggered on form submission
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

  /**
   * The service type of the associated metric
   */
  serviceType: CloudPulseServiceType;
}
export const CloudPulseDimensionFilterRenderer = React.memo(
  (props: CloudPulseDimensionFilterRendererProps) => {
    const {
      dimensionOptions,
      selectedEntities = [],
      selectedDimensions,
      onSubmit,
      clearAllTrigger,
      onClose,
      serviceType,
      onDimensionChange,
    } = props;

    const formMethods = useForm<MetricsDimensionFilterForm>({
      defaultValues: {
        dimension_filters:
          selectedDimensions && selectedDimensions.length > 0
            ? selectedDimensions
            : [],
      },
      mode: 'onBlur',
      resolver: yupResolver(metricDimensionFiltersSchema),
    });
    const { control, handleSubmit, formState, setValue, clearErrors } =
      formMethods;

    const { isDirty } = formState;

    const formRef = React.useRef<HTMLFormElement>(null);
    const handleFormSubmit = handleSubmit(async (values) => {
      onSubmit({
        dimension_filters: values.dimension_filters,
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
      // set a single empty filter
      if (clearAllTrigger > 0) {
        setValue('dimension_filters', [], {
          shouldDirty: true,
          shouldValidate: false,
        });
        clearErrors('dimension_filters');
      }
    }, [clearAllTrigger, clearErrors, setValue]);

    React.useEffect(() => {
      if (fields.length) {
        onDimensionChange(true);
      } else {
        onDimensionChange(false);
      }
    }, [fields, onDimensionChange]);

    return (
      <FormProvider {...formMethods}>
        <form onSubmit={handleFormSubmit} ref={formRef}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Stack gap={1.25}>
              {fields?.length > 0 &&
                fields.map((field, index) => (
                  <>
                    <CloudPulseDimensionFilterFields
                      dimensionOptions={dimensionOptions}
                      key={field.id}
                      name={`dimension_filters.${index}`}
                      onFilterDelete={() => remove(index)}
                      selectedEntities={selectedEntities}
                      serviceType={serviceType}
                    />
                    <Divider
                      sx={(theme) => ({
                        display: 'none',
                        [theme.breakpoints.down('md')]: {
                          // only show the divider for smaller screens
                          display:
                            index === fields.length - 1 ? 'none' : 'flex',
                        },
                      })}
                    />
                  </>
                ))}
            </Stack>
            <Button
              compactX
              data-qa-buttons="true"
              data-testid="Add Filter"
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
            >
              Add Filter
            </Button>
          </Box>
          <ActionsPanel
            primaryButtonProps={{
              label: 'Apply',
              type: 'submit',
              disabled:
                selectedDimensions && selectedDimensions.length > 0 && !isDirty,
              sx: {
                width: '65px',
              },
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: () => {
                onClose();
              },
              buttonType: 'outlined',
              sx: {
                width: '70px',
              },
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </form>
      </FormProvider>
    );
  }
);
