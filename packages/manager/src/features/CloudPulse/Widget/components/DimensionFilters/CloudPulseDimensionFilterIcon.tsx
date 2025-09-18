import { IconButton } from '@linode/ui';
import React from 'react';

import { CloudPulseTooltip } from 'src/features/CloudPulse/shared/CloudPulseTooltip';

import { CloudPulseDimensionFilterDrawer } from './CloudPulseDimensionFilterDrawer';
import { FilterIconWithBadge } from './FilterIconWithBadge';

import type { Dimension } from '@linode/api-v4';
import type { DimensionFilterForm } from 'src/features/CloudPulse/Alerts/CreateAlert/types';

interface CloudPulseDimensionFilterIconProps {
  dimensionOptions: Dimension[];
  handleSelectionChange: (selectedDimensions: DimensionFilterForm[]) => void;
  selectedDimensions?: DimensionFilterForm[];
}

export const CloudPulseDimensionFilterIcon = (
  props: CloudPulseDimensionFilterIconProps
) => {
  const [isSelected] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { dimensionOptions, selectedDimensions, handleSelectionChange } = props;

  const handleChangeInSelection = (selectedValue: DimensionFilterForm[]) => {
    handleSelectionChange(selectedValue);
    setOpen(false);
  };

  return (
    <>
      <CloudPulseTooltip placement="bottom-end" title="Group By">
        <IconButton
          aria-label="Group By Dashboard Metrics"
          color="inherit"
          data-qa-selected={isSelected}
          data-testid="group-by"
          disabled={dimensionOptions.length === 0}
          onClick={() => setOpen(true)}
          size="small"
          sx={(theme) => ({
            marginBlockEnd: 'auto',
            color: isSelected ? theme.color.buttonPrimaryHover : 'inherit',
            padding: 0,
          })}
        >
          <FilterIconWithBadge count={selectedDimensions?.length} />
        </IconButton>
      </CloudPulseTooltip>
      <CloudPulseDimensionFilterDrawer
        dimensionOptions={dimensionOptions}
        handleSelectionChange={handleChangeInSelection}
        onClose={() => setOpen(false)}
        open={open}
        selectedDimensions={selectedDimensions}
      />
    </>
  );
};
