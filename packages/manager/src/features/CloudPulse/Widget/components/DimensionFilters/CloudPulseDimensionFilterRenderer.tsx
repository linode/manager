import { ActionsPanel, Box, Button, Stack } from '@linode/ui';
import React from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';

import { CloudPulseDimensionFilter } from './CloudPulseDimensionFilter';

import type { Dimension } from '@linode/api-v4';
import type {
  DimensionFilterForm,
  OnlyDimensionFilterForm,
} from 'src/features/CloudPulse/Alerts/CreateAlert/types';

interface CloudPulseDimensionFilterRendererProps {
  /**
   * boolean value to disable the Data Field in dimension filter
   */
  dataFieldDisabled: boolean;
  /**
   * dimension filter data for the selected metric
   */
  dimensionOptions: Dimension[];

  onSubmit: (data: OnlyDimensionFilterForm) => void;

  selectedDimensions?: DimensionFilterForm[];
}
export const CloudPulseDimensionFilterRenderer = (
  props: CloudPulseDimensionFilterRendererProps
) => {
  const { dataFieldDisabled, dimensionOptions, onSubmit, selectedDimensions } =
    props;
  const formMethods = useForm<OnlyDimensionFilterForm>({
    defaultValues: {
      dimension_filters: selectedDimensions || [],
    },
    mode: 'onBlur',
  });
  const { control, handleSubmit } = formMethods;

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'dimension_filters',
  });

  const dimensionFilterWatcher = useWatch({
    control,
    name: 'dimension_filters',
  });
  const formRef = React.useRef<HTMLFormElement>(null);
  const onSubmitHere = handleSubmit(async (values) => {
    onSubmit(values);
  });
  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onSubmitHere} ref={formRef}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Stack gap={1}>
            {fields?.length > 0 &&
              fields.map((field, index) => (
                <CloudPulseDimensionFilter
                  dataFieldDisabled={dataFieldDisabled}
                  dimensionOptions={dimensionOptions}
                  key={field.id}
                  name={`dimension_filters.${index}`}
                  onFilterDelete={() => remove(index)}
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
            Add dimension filter
          </Button>
        </Box>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Submit',
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: () => {
              onSubmit({ dimension_filters: selectedDimensions || [] });
            },
          }}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        />
      </form>
    </FormProvider>
  );
};
