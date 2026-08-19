import * as React from 'react';

import type { TooltipFilterHandlerResult } from './chartTypes';

export const useTooltipFilterHandler = (): TooltipFilterHandlerResult => {
  const [isHoverFilterEnabled, setIsHoverFilterEnabled] = React.useState(false);
  const [pinnedTooltipDataKey, setPinnedTooltipDataKey] = React.useState<
    string | undefined
  >(undefined);
  const [hoveredTooltipDataKey, setHoveredTooltipDataKey] = React.useState<
    string | undefined
  >(undefined);

  const tooltipFilter = React.useMemo(() => {
    const selectedDataKey = hoveredTooltipDataKey ?? pinnedTooltipDataKey;

    if (selectedDataKey === undefined) {
      return undefined;
    }

    return {
      dataKey: selectedDataKey,
    };
  }, [hoveredTooltipDataKey, pinnedTooltipDataKey]);

  const handleActiveDotClick = React.useCallback(
    (dataKey: string) => {
      setHoveredTooltipDataKey(undefined);

      if (pinnedTooltipDataKey === dataKey) {
        setPinnedTooltipDataKey(undefined);
        setIsHoverFilterEnabled(false);
        return;
      }

      setPinnedTooltipDataKey(dataKey);
      setIsHoverFilterEnabled(true);
    },
    [pinnedTooltipDataKey]
  );

  const handleActiveDotMouseEnter = React.useCallback(
    (dataKey: string) => {
      if (!isHoverFilterEnabled) {
        return;
      }

      setPinnedTooltipDataKey(dataKey);
      setHoveredTooltipDataKey(dataKey);
    },
    [isHoverFilterEnabled]
  );

  const handleActiveDotMouseLeave = React.useCallback(() => {
    setHoveredTooltipDataKey(undefined);
  }, []);

  const handleTooltipFilterOnChartClick = React.useCallback(() => {
    if (pinnedTooltipDataKey !== undefined) {
      setPinnedTooltipDataKey(undefined);
      setHoveredTooltipDataKey(undefined);
      setIsHoverFilterEnabled(false);
    }
  }, [pinnedTooltipDataKey]);

  const resetTooltipFilter = React.useCallback(() => {
    setPinnedTooltipDataKey(undefined);
    setHoveredTooltipDataKey(undefined);
    setIsHoverFilterEnabled(false);
  }, []);

  return {
    handleActiveDotClick,
    handleActiveDotMouseEnter,
    handleActiveDotMouseLeave,
    handleTooltipFilterOnChartClick,
    resetTooltipFilter,
    tooltipFilter,
  };
};
