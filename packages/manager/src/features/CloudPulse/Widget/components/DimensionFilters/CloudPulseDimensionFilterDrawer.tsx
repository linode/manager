import { Drawer, Stack, Typography } from '@linode/ui';
import React from 'react';
import {
  type Control,
  useFormContext,
  type UseFormHandleSubmit,
} from 'react-hook-form';

import { CloudPulseDimensionFilterRenderer } from './CloudPulseDimensionFilterRenderer';

import type { Dimension } from '@linode/api-v4';
import type {
  DimensionFilterForm,
  OnlyDimensionFilterForm,
} from 'src/features/CloudPulse/Alerts/CreateAlert/types';

interface CloudPulseDimensionFilterDrawerProps {
  control: Control<OnlyDimensionFilterForm>;
  dimensionOptions: Dimension[];
  handleSelectionChange: (
    selectedDimensions: DimensionFilterForm[],
    close: boolean
  ) => void;
  handleSubmit: UseFormHandleSubmit<OnlyDimensionFilterForm>;
  onClose: () => void;
  open: boolean;
  selectedDimensions?: DimensionFilterForm[];
  selectedEntities?: string[];
  widgetMetricName: string;
}

export const CloudPulseDimensionFilterDrawer = (
  props: CloudPulseDimensionFilterDrawerProps
) => {
  const {
    onClose,
    open,
    dimensionOptions,
    selectedDimensions,
    handleSelectionChange,
    widgetMetricName,
    control,
    handleSubmit,
    selectedEntities,
  } = props;

  const handleClose = () => {
    onClose();
  };

  const handleSubmitHere = (data: OnlyDimensionFilterForm) => {
    handleSelectionChange(data.dimension_filters, true);
  };

  const { reset } = useFormContext<OnlyDimensionFilterForm>();

  return (
    <Drawer onClose={(_) => handleClose()} open={open} title="Filters" wide>
      <Stack gap={4}>
        <Stack direction="row" justifyContent="space-between">
          <Typography
            data-qa-id="filter-drawer-subtitle"
            sx={(theme) => ({ marginTop: -2, font: theme.font.normal })}
            variant="h3"
          >
            {widgetMetricName}
          </Typography>
          <Typography
            component="a"
            data-qa-id="filter-drawer-clear-all"
            onClick={() => {
              reset({
                dimension_filters: [
                  {
                    dimension_label: null,
                    operator: null,
                    value: null,
                  },
                ],
              });
            }}
            sx={(theme) => ({
              marginTop: -2,
              font: theme.font.normal,
              color: theme.textColors.linkActiveLight,
            })}
            variant="h3"
          >
            Clear All
          </Typography>
        </Stack>
        <Typography
          data-qa-id="filter-drawer-selection-title"
          sx={(theme) => ({ font: theme.font.semibold })}
        >
          Select upto 5 Dimension Filters
        </Typography>
        <CloudPulseDimensionFilterRenderer
          control={control}
          dataFieldDisabled={false}
          dimensionOptions={dimensionOptions}
          handleSubmit={handleSubmit}
          onSubmit={handleSubmitHere}
          selectedDimensions={selectedDimensions}
          selectedEntities={selectedEntities}
        />
      </Stack>
    </Drawer>
  );
};
