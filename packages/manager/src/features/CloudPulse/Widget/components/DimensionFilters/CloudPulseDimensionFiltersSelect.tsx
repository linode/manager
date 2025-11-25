import { IconButton } from '@linode/ui';
import React from 'react';

import { CloudPulseTooltip } from 'src/features/CloudPulse/shared/CloudPulseTooltip';
import { getAssociatedEntityType } from 'src/features/CloudPulse/Utils/FilterConfig';

import { CloudPulseDimensionFilterDrawer } from './CloudPulseDimensionFilterDrawer';
import { CloudPulseDimensionFilterIconWithBadge } from './CloudPulseFilterIconWithBadge';

import type { MetricsDimensionFilter } from './types';
import type { CloudPulseServiceType, Dimension } from '@linode/api-v4';

interface CloudPulseDimensionFiltersSelectProps {
  /**
   * The dashboardId for which the widget and dimension filters are being rendered
   */
  dashboardId: number;
  /**
   * The list of available dimensions for the selected metric
   */
  dimensionOptions: Dimension[];
  /**
   * The label for the drawer, typically the name of the metric
   */
  drawerLabel: string;
  /**
   * @param selectedDimensions The list of selected dimension filters
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

  /**
   * The selected regions of the associated entities
   */
  selectedRegions?: string[];

  /**
   * The service type of the associated metric
   */
  serviceType: CloudPulseServiceType;
}

export const CloudPulseDimensionFiltersSelect = React.memo(
  (props: CloudPulseDimensionFiltersSelectProps) => {
    const {
      dimensionOptions,
      selectedDimensions,
      handleSelectionChange,
      drawerLabel,
      selectedEntities,
      serviceType,
      selectedRegions,
      dashboardId,
    } = props;
    const [open, setOpen] = React.useState(false);

    const handleChangeInSelection = React.useCallback(
      (selectedValue: MetricsDimensionFilter[], close: boolean) => {
        if (close) {
          handleSelectionChange(selectedValue);
          setOpen(false);
        }
      },
      [handleSelectionChange]
    );

    const selectionCount = selectedDimensions?.length ?? 0;

    return (
      <>
        <CloudPulseTooltip placement="bottom-end" title="Dimension Filters">
          <IconButton
            aria-label="Widget Dimension Filter"
            color="inherit"
            data-qa-selected={selectionCount}
            data-testid="dimension-filter"
            disabled={!dimensionOptions.length}
            onClick={() => setOpen(true)}
            size="small"
            sx={(theme) => ({
              marginBlockEnd: 'auto',
              color: selectionCount
                ? theme.color.buttonPrimaryHover
                : 'inherit',
              padding: 0,
            })}
          >
            <CloudPulseDimensionFilterIconWithBadge count={selectionCount} />
          </IconButton>
        </CloudPulseTooltip>
        <CloudPulseDimensionFilterDrawer
          associatedEntityType={getAssociatedEntityType(dashboardId)}
          dimensionOptions={dimensionOptions}
          drawerLabel={drawerLabel}
          handleSelectionChange={handleChangeInSelection}
          onClose={() => setOpen(false)}
          open={open}
          selectedDimensions={selectedDimensions}
          selectedEntities={selectedEntities}
          selectedRegions={selectedRegions}
          serviceType={serviceType}
        />
      </>
    );
  }
);
