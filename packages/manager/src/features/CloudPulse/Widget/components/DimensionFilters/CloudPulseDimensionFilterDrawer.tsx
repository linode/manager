import { Drawer, Stack } from '@linode/ui';
import React from 'react';

import { CloudPulseDimensionFilterRenderer } from './CloudPulseDimensionFilterRenderer';

import type { Dimension } from '@linode/api-v4';
import type {
  DimensionFilterForm,
  OnlyDimensionFilterForm,
} from 'src/features/CloudPulse/Alerts/CreateAlert/types';

interface CloudPulseDimensionFilterDrawerProps {
  dimensionOptions: Dimension[];
  handleSelectionChange: (selectedDimensions: DimensionFilterForm[]) => void;
  onClose: () => void;
  open: boolean;
  selectedDimensions?: DimensionFilterForm[];
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
  } = props;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (data: OnlyDimensionFilterForm) => {
    handleSelectionChange(data.dimension_filters);
  };

  return (
    <Drawer
      onClose={(_) => handleClose()}
      open={open}
      title="Dimension Filter"
      wide={true}
    >
      <Stack>
        <CloudPulseDimensionFilterRenderer
          dataFieldDisabled={false}
          dimensionOptions={dimensionOptions}
          onSubmit={handleSubmit}
          selectedDimensions={selectedDimensions}
        />
      </Stack>
    </Drawer>
  );
};
