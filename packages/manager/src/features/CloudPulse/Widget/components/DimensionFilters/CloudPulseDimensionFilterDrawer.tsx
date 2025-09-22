import { Drawer, Stack, Typography } from '@linode/ui';
import React from 'react';

import { CloudPulseDimensionFilterRenderer } from './CloudPulseDimensionFilterRenderer';

import type {
  MetricsDimensionFilter,
  MetricsDimensionFilterForm,
} from './types';
import type { Dimension } from '@linode/api-v4';

interface CloudPulseDimensionFilterDrawerProps {
  /**
   * The list of dimensions associated with the selected metric
   */
  dimensionOptions: Dimension[];
  /**
   * The label for the drawer, typically the name of the metric
   */
  drawerLabel: string;
  /**
   * @param selectedDimensions The list of selected dimension filters
   * @param close Property to determine whether to close the drawer after selection
   * @returns
   */
  handleSelectionChange: (
    selectedDimensions: MetricsDimensionFilter[],
    close: boolean
  ) => void;
  /**
   * The callback to close the drawer
   * @returns
   */
  onClose: () => void;
  /**
   * The boolean value to control the drawer open state
   */
  open: boolean;
  /**
   * The selected dimension filters for the metric
   */
  selectedDimensions?: MetricsDimensionFilter[];
  /**
   * The selected entities for the dimension filter
   */
  selectedEntities?: string[];
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
    drawerLabel,
    selectedEntities,
  } = props;

  const [clearAllTrigger, setClearAllTrigger] = React.useState(0);

  const handleClose = () => {
    onClose();
    setClearAllTrigger(0); // After closing the drawer, reset the clear all trigger
  };

  const handleFormSubmit = (data: MetricsDimensionFilterForm) => {
    handleSelectionChange(data.dimension_filters, true);
    setClearAllTrigger(0); // After submission, reset the clear all trigger
  };

  return (
    <Drawer onClose={(_) => handleClose()} open={open} title="Filters" wide>
      <Stack gap={4}>
        <Stack direction="row" justifyContent="space-between">
          <Typography
            data-qa-id="filter-drawer-subtitle"
            sx={(theme) => ({ marginTop: -2, font: theme.font.normal })}
            variant="h3"
          >
            {drawerLabel}
          </Typography>
          <Typography
            component="a"
            data-qa-id="filter-drawer-clear-all"
            onClick={() => {
              setClearAllTrigger((prev) => prev + 1);
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
          clearAllTrigger={clearAllTrigger}
          dataFieldDisabled={false}
          dimensionOptions={dimensionOptions}
          onClose={handleClose}
          onSubmit={handleFormSubmit}
          selectedDimensions={selectedDimensions}
          selectedEntities={selectedEntities}
        />
      </Stack>
    </Drawer>
  );
};
