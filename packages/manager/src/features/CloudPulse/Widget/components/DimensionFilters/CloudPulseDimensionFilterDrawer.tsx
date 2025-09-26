import { Button, Drawer, Stack, Typography } from '@linode/ui';
import React from 'react';

import { CloudPulseDimensionFilterRenderer } from './CloudPulseDimensionFilterRenderer';

import type {
  MetricsDimensionFilter,
  MetricsDimensionFilterForm,
} from './types';
import type { CloudPulseServiceType, Dimension } from '@linode/api-v4';

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
   */
  handleSelectionChange: (
    selectedDimensions: MetricsDimensionFilter[],
    close: boolean
  ) => void;
  /**
   * The callback to close the drawer
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

  /**
   * The service type of the associated metric
   */
  serviceType: CloudPulseServiceType;
}

export const CloudPulseDimensionFilterDrawer = React.memo(
  (props: CloudPulseDimensionFilterDrawerProps) => {
    const {
      onClose,
      open,
      dimensionOptions,
      selectedDimensions,
      handleSelectionChange,
      drawerLabel,
      selectedEntities,
      serviceType,
    } = props;

    const [clearAllTrigger, setClearAllTrigger] = React.useState(0);
    const [hideClearAll, setHideClearAll] = React.useState(
      !selectedDimensions?.length
    );

    const handleClose = React.useCallback(() => {
      onClose();
      setClearAllTrigger(0); // After closing the drawer, reset the clear all trigger
    }, [onClose]);

    const onDimensionChange = React.useCallback((isDirty: boolean) => {
      setHideClearAll(!isDirty);
    }, []);

    const handleFormSubmit = React.useCallback(
      ({ dimension_filters: dimensionFilters }: MetricsDimensionFilterForm) => {
        handleSelectionChange(dimensionFilters, true);
        setClearAllTrigger(0); // After submission, reset the clear all trigger
      },
      [handleSelectionChange]
    );

    return (
      <Drawer onClose={(_) => handleClose()} open={open} title="Filters" wide>
        <Stack gap={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography
              data-qa-id="filter-drawer-subtitle"
              sx={(theme) => ({ marginTop: -2, font: theme.font.normal })}
              variant="h3"
            >
              {drawerLabel}
            </Typography>
            <Button
              component="a"
              data-qa-id="filter-drawer-clear-all"
              onClick={() => {
                setClearAllTrigger((prev) => prev + 1);
              }}
              sx={(theme) => ({
                marginTop: -2,
                font: theme.font.normal,
                color: theme.textColors.linkActiveLight,
                display: hideClearAll ? 'none' : 'flex',
              })}
              variant="text"
            >
              Clear All
            </Button>
          </Stack>
          <Typography
            data-qa-id="filter-drawer-selection-title"
            sx={(theme) => ({ font: theme.font.semibold })}
          >
            Select up to 5 Dimension Filters
          </Typography>
          <CloudPulseDimensionFilterRenderer
            clearAllTrigger={clearAllTrigger}
            dataFieldDisabled={false}
            dimensionOptions={dimensionOptions}
            onClose={handleClose}
            onDimensionChange={onDimensionChange}
            onSubmit={handleFormSubmit}
            selectedDimensions={selectedDimensions}
            selectedEntities={selectedEntities}
            serviceType={serviceType}
          />
        </Stack>
      </Drawer>
    );
  }
);
