import { IconButton } from '@linode/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { CloudPulseTooltip } from 'src/features/CloudPulse/shared/CloudPulseTooltip';

import { CloudPulseDimensionFilterDrawer } from './CloudPulseDimensionFilterDrawer';
import { FilterIconWithBadge } from './FilterIconWithBadge';

import type { Dimension } from '@linode/api-v4';
import type {
  DimensionFilterForm,
  OnlyDimensionFilterForm,
} from 'src/features/CloudPulse/Alerts/CreateAlert/types';

interface CloudPulseDimensionFilterIconProps {
  dimensionOptions: Dimension[];
  handleSelectionChange: (selectedDimensions: DimensionFilterForm[]) => void;
  selectedDimensions?: DimensionFilterForm[];
  selectedEntities?: string[];
  widgetMetricName: string;
}

export const CloudPulseDimensionFilterIcon = (
  props: CloudPulseDimensionFilterIconProps
) => {
  const {
    dimensionOptions,
    selectedDimensions,
    handleSelectionChange,
    widgetMetricName,
    selectedEntities,
  } = props;
  const [open, setOpen] = React.useState(false);

  const handleChangeInSelection = (
    selectedValue: DimensionFilterForm[],
    close: boolean
  ) => {
    handleSelectionChange(selectedValue);
    if (close) {
      setOpen(false);
    }
  };

  const formMethods = useForm<OnlyDimensionFilterForm>({
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
  });
  const { control, handleSubmit } = formMethods;

  return (
    <FormProvider {...formMethods}>
      <CloudPulseTooltip placement="bottom-end" title="Dimension Filter">
        <IconButton
          aria-label="Widget Dimension Filter"
          color="inherit"
          data-qa-selected={selectedDimensions?.length}
          data-testid="dimension-filter"
          disabled={dimensionOptions.length === 0}
          onClick={() => setOpen(true)}
          size="small"
          sx={(theme) => ({
            marginBlockEnd: 'auto',
            color: selectedDimensions?.length
              ? theme.color.buttonPrimaryHover
              : 'inherit',
            padding: 0,
          })}
        >
          <FilterIconWithBadge count={selectedDimensions?.length} />
        </IconButton>
      </CloudPulseTooltip>
      <CloudPulseDimensionFilterDrawer
        control={control}
        dimensionOptions={dimensionOptions}
        handleSelectionChange={handleChangeInSelection}
        handleSubmit={handleSubmit}
        onClose={() => setOpen(false)}
        open={open}
        selectedDimensions={selectedDimensions}
        selectedEntities={selectedEntities}
        widgetMetricName={widgetMetricName}
      />
    </FormProvider>
  );
};
