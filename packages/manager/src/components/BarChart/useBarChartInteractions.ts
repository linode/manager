import React from 'react';

import type { CustomTooltipOptions } from '../chartTypes';

interface UseBarChartInteractionsProps {
  customTooltipOptions?: CustomTooltipOptions;
  onHiddenBarsChange?: (hiddenKeys: string[]) => void;
}

/**
 * Legend/active-series/tooltip-filter state and effects shared by every bar chart x-axis variant.
 */
export const useBarChartInteractions = ({
  customTooltipOptions,
  onHiddenBarsChange,
}: UseBarChartInteractionsProps) => {
  const {
    tooltipFilter,
    onFilteredTooltipChange,
    isTooltipVisible,
    activeDotHandlers,
  } = customTooltipOptions ?? {};
  const {
    onClick: onActiveDotClick,
    onMouseEnter: onActiveDotMouseEnter,
    onMouseLeave: onActiveDotMouseLeave,
  } = activeDotHandlers ?? {};

  const [activeSeries, setActiveSeries] = React.useState<Array<string>>([]);

  const handleLegendClick = (dataKey: string) => {
    if (activeSeries.includes(dataKey)) {
      setActiveSeries(activeSeries.filter((el) => el !== dataKey));
    } else {
      setActiveSeries((prev) => [...prev, dataKey]);
    }
  };

  React.useLayoutEffect(() => {
    onFilteredTooltipChange?.();
  }, [onFilteredTooltipChange, tooltipFilter]);

  React.useEffect(() => {
    onHiddenBarsChange?.(activeSeries);
  }, [activeSeries, onHiddenBarsChange]);

  return {
    activeSeries,
    handleLegendClick,
    isTooltipVisible,
    onActiveDotClick,
    onActiveDotMouseEnter,
    onActiveDotMouseLeave,
  };
};
