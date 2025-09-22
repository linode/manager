import { IconButton } from '@linode/ui';
import React from 'react';

import { CloudPulseTooltip } from 'src/features/CloudPulse/shared/CloudPulseTooltip';

import { CloudPulseDimensionFilterDrawer } from './CloudPulseDimensionFilterDrawer';
import { CloudPulseDimensionFilterIconWithBadge } from './FilterIconWithBadge';

import type { MetricsDimensionFilter } from './types';
import type { Dimension } from '@linode/api-v4';

interface CloudPulseDimensionFilterSelectProps {
  /**
   * The list of available dimensions for the selected metric
   */
  dimensionOptions: Dimension[];
  /**
   * The label for the drawer, typically the name of the metric
   */
  drawerLabel: string;
  /**
   *
   * @param selectedDimensions The list of selected dimension filters
   * @returns
   */
  handleSelectionChange: (selectedDimensions: MetricsDimensionFilter[]) => void;
  /**
   * The selected dimension filters for the metric
   */
  selectedDimensions?: MetricsDimensionFilter[];
  /**
   * The selected entities for the dimension filter
   */
  selectedEntities?: string[];
}

export const CloudPulseDimensionFilterSelect = (
  props: CloudPulseDimensionFilterSelectProps
) => {
  const {
    dimensionOptions,
    selectedDimensions,
    handleSelectionChange,
    drawerLabel,
    selectedEntities,
  } = props;
  const [open, setOpen] = React.useState(false);

  const handleChangeInSelection = (
    selectedValue: MetricsDimensionFilter[],
    close: boolean
  ) => {
    if (close) {
      handleSelectionChange(selectedValue);
      setOpen(false);
    }
  };

  return (
    <>
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
          <CloudPulseDimensionFilterIconWithBadge
            count={selectedDimensions?.length ?? 0}
          />
        </IconButton>
      </CloudPulseTooltip>
      <CloudPulseDimensionFilterDrawer
        dimensionOptions={dimensionOptions}
        drawerLabel={drawerLabel}
        handleSelectionChange={handleChangeInSelection}
        onClose={() => setOpen(false)}
        open={open}
        selectedDimensions={selectedDimensions}
        selectedEntities={selectedEntities}
      />
    </>
  );
};
