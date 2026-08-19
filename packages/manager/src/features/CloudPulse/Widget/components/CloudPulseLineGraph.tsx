import { roundTo } from '@akamai/compute-ui-core/formatting';
import { Button, CircleProgress, ErrorState, Typography } from '@linode/ui';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { useFlags } from 'src/hooks/useFlags';

import {
  computeLegendRowsBasedOnData,
  computeZoomedInData,
} from '../../Utils/CloudPulseZoomInUtils';
import { humanizeLargeData } from '../../Utils/utils';
import { CloudPulseTooltip } from './CloudPulseTooltip';
import { useTooltipFilterHandler } from './useTooltipFilterHandler';
import { useTooltipPositioning } from './useTooltipPositioning';
import { useTooltipVisibilityHandler } from './useTooltipVisibilityHandler';
import { useZoomController } from './useZoomController';

import type { MouseHandlerDataParam } from 'recharts';
import type {
  AreaChartProps,
  DataSet,
  TooltipEntriesByTimestamp,
  TooltipMetricEntry,
} from 'src/components/AreaChart/AreaChart';

export interface CloudPulseLineGraph extends AreaChartProps {
  data: DataSet[];
  error?: string;
  loading?: boolean;
  onHiddenAreasChange?: (hiddenKeys: string[]) => void;
  onZoomChange?: (
    isZoomed: boolean,
    left: 'dataMin' | number,
    right: 'dataMax' | number
  ) => void;
  widgetLabel: string;
  zoomResetKey: string;
}

export const CloudPulseLineGraph = React.memo((props: CloudPulseLineGraph) => {
  const {
    error,
    loading,
    unit,
    data,
    legendRows,
    zoomResetKey,
    onZoomChange,
    showLegend,
    widgetLabel,
    onHiddenAreasChange,
    areas,
    ...rest
  } = props;
  const flags = useFlags();

  const theme = useTheme();

  const isCustomTooltipEnabled = flags.aclp?.enableCustomTooltip ?? false; // default to false

  const areaColorMap = React.useMemo(() => {
    if (!isCustomTooltipEnabled) return undefined;
    const map: Record<string, string> = {};
    areas?.forEach(({ dataKey, color }) => {
      map[dataKey] = color;
    });
    return map;
  }, [areas, isCustomTooltipEnabled]);

  // to reduce the x-axis tick count for small screen
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const isHumanizableUnit =
    flags.aclp?.humanizableUnits?.some(
      (unitElement) => unitElement.toLowerCase() === unit.toLowerCase()
    ) ?? false;

  const isZoomEnabled = flags.aclp?.enableZoomInCharts ?? false; // default to false

  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md')); // no need to enable dynamic tooltip positioning on mobile and tablets

  const {
    zoom,
    isZoomed,
    zoomOut: resetZoom,
    zoomCallbacks,
  } = useZoomController(zoomResetKey);

  const {
    tooltipPos,
    tooltipMaxHeight,
    handleMouseMove: handleTooltipPositioningMouseMove,
    chartContainerRef,
    tooltipRef,
    recalculate,
    reset,
  } = useTooltipPositioning(
    isZoomEnabled ? zoomCallbacks?.onMouseMove : undefined,
    isMobileOrTablet
  );
  const {
    handleActiveDotClick,
    handleActiveDotMouseEnter,
    handleActiveDotMouseLeave,
    handleTooltipFilterOnChartClick,
    resetTooltipFilter,
    tooltipFilter,
  } = useTooltipFilterHandler();
  const { claimTooltipVisibility, isTooltipVisible, releaseTooltipVisibility } =
    useTooltipVisibilityHandler(resetTooltipFilter);

  // Tooltip-specific mouse handlers (custom tooltip only)
  const tooltipMouseHandlers = React.useMemo(
    () =>
      isCustomTooltipEnabled
        ? {
            onMouseMove: (chartData: MouseHandlerDataParam) => {
              claimTooltipVisibility();
              handleTooltipPositioningMouseMove(chartData);
            },
            onMouseLeave: () => {
              releaseTooltipVisibility();
              reset();
            },
            onClick: (chartData: MouseHandlerDataParam) => {
              if (chartData.isTooltipActive && tooltipFilter?.dataKey) {
                handleTooltipFilterOnChartClick();
              }
            },
          }
        : {
            onMouseMove: (chartData: MouseHandlerDataParam) =>
              handleTooltipPositioningMouseMove(chartData),
            onMouseLeave: undefined,
            onClick: undefined,
          },
    [
      isCustomTooltipEnabled,
      claimTooltipVisibility,
      handleTooltipPositioningMouseMove,
      releaseTooltipVisibility,
      reset,
      tooltipFilter?.dataKey,
      handleTooltipFilterOnChartClick,
    ]
  );

  const zoomCallbackHandlers = React.useMemo(
    () =>
      isZoomEnabled
        ? {
            onMouseDown: (chartData: MouseHandlerDataParam) => {
              zoomCallbacks?.onMouseDown?.(chartData);
            },
            onMouseMove: (chartData: MouseHandlerDataParam) => {
              zoomCallbacks?.onMouseMove?.(chartData);
            },
            onMouseUp: () => {
              zoomCallbacks?.onMouseUp?.();
            },
          }
        : undefined,
    [isZoomEnabled, zoomCallbacks]
  );

  const zoomedData = React.useMemo(() => {
    if (!isZoomEnabled) {
      return data;
    }
    return computeZoomedInData({ data, zoom });
  }, [data, zoom, isZoomEnabled]);

  const zoomedLegendRows = React.useMemo(() => {
    if (!isZoomEnabled) {
      return legendRows;
    }
    return computeLegendRowsBasedOnData({
      zoom,
      data: zoomedData,
      legendRows,
      unit: props.unit,
      isHumanizableUnit,
    });
  }, [
    isHumanizableUnit,
    isZoomEnabled,
    legendRows,
    props.unit,
    zoom,
    zoomedData,
  ]);

  const tooltipEntriesByTimestamp = React.useMemo<
    TooltipEntriesByTimestamp | undefined
  >(() => {
    if (!isCustomTooltipEnabled) {
      return undefined;
    }

    const entriesByTimestamp = new Map<number, TooltipMetricEntry[]>();

    for (const dataPoint of zoomedData) {
      const metricEntries = Object.entries(dataPoint)
        .filter(
          (entry): entry is TooltipMetricEntry =>
            entry[0] !== 'timestamp' && typeof entry[1] === 'number'
        )
        .sort(([, firstValue], [, secondValue]) => secondValue - firstValue);

      entriesByTimestamp.set(dataPoint.timestamp, metricEntries);
    }

    return entriesByTimestamp;
  }, [isCustomTooltipEnabled, zoomedData]);

  React.useEffect(() => {
    if (onZoomChange) {
      onZoomChange(isZoomed, zoom.left, zoom.right);
    }
  }, [isZoomed, onZoomChange, zoom.left, zoom.right]);

  if (loading) {
    return <CircleProgress sx={{ minHeight: '380px' }} />;
  }

  if (error) {
    return <ErrorState errorText={error} />;
  }

  const noDataMessage = 'No data to display';
  return (
    <Box
      sx={{
        p: 2,
        position: 'relative',
      }}
    >
      {error ? (
        <Box sx={{ height: '100%' }}>
          <ErrorState errorText={error} />
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={3}>
          {isZoomed && (
            <Button
              buttonType="primary"
              data-pendo-id={`cloudpulse-widget-reset-zoomin-${widgetLabel}`}
              data-qa-buttons
              onClick={resetZoom}
              sx={(theme) => ({
                height: '26px',
                width: '88px',
                padding: theme.spacingFunction(4, 8),
                fontSize: theme.tokens.font.FontSize.Xxxs,
              })}
              variant="contained"
            >
              Reset Zoom
            </Button>
          )}
          <AreaChart
            {...rest}
            areas={areas}
            chartCallbacks={{
              onMouseDown: (chartData) => {
                zoomCallbackHandlers?.onMouseDown?.(chartData);
              },
              onClick: (chartData) => {
                tooltipMouseHandlers.onClick?.(chartData);
              },
              onMouseMove: (chartData) => {
                tooltipMouseHandlers.onMouseMove?.(chartData);
                zoomCallbackHandlers?.onMouseMove?.(chartData);
              },
              onMouseLeave: tooltipMouseHandlers.onMouseLeave,
              onMouseUp: zoomCallbackHandlers?.onMouseUp,
            }}
            chartContainerRef={chartContainerRef}
            CustomConsumerTooltip={
              isCustomTooltipEnabled ? CloudPulseTooltip : undefined
            }
            customTooltipOptions={
              isCustomTooltipEnabled
                ? {
                    areasColorMap: areaColorMap,
                    tooltipEntriesByTimestamp,
                    tooltipWrapperStyle: {
                      maxHeight: `${tooltipMaxHeight}px`,
                      overflow: 'hidden',
                      minHeight: '44px',
                      maxWidth: '300px',
                      minWidth: '190px',
                      contain: 'layout',
                    },
                    activeDotHandlers: {
                      onClick: handleActiveDotClick,
                      onMouseEnter: handleActiveDotMouseEnter,
                      onMouseLeave: handleActiveDotMouseLeave,
                    },
                    isTooltipVisible,
                    onFilteredTooltipChange: recalculate,
                    tooltipFilter,
                  }
                : undefined
            }
            data={zoomedData}
            fillOpacity={0.5}
            legendHeight="165px"
            legendRows={zoomedLegendRows}
            margin={{
              bottom: 0,
              left: -15,
              right: 30,
              top: 2,
            }}
            onHiddenAreasChange={onHiddenAreasChange}
            referenceArea={
              zoom.refAreaLeft !== undefined && zoom.refAreaRight !== undefined
                ? {
                    referenceStart: zoom.refAreaLeft,
                    referenceEnd: zoom.refAreaRight,
                  }
                : null
            }
            showLegend={zoomedData.length > 0 ? showLegend : false}
            tooltipCustomValueFormatter={(value) => {
              const formattedValue = isHumanizableUnit
                ? humanizeLargeData(value)
                : roundTo(value);

              return isCustomTooltipEnabled
                ? `${formattedValue}`
                : `${formattedValue} ${unit}`;
            }}
            tooltipPosition={tooltipPos}
            tooltipRef={tooltipRef}
            unit={unit}
            xAxisTickCount={
              isSmallScreen ? undefined : Math.min(zoomedData.length, 7)
            }
            yAxisProps={
              isHumanizableUnit
                ? {
                    tickFormat: (value: number) =>
                      `${humanizeLargeData(value)}`,
                  }
                : {
                    tickFormat: (value: number) => `${roundTo(value, 3)}`,
                  }
            }
          />
        </Box>
      )}
      {zoomedData.length === 0 && (
        <Box
          sx={{
            bottom: '50%',
            left: '45%',
            position: 'absolute',
          }}
        >
          <Typography variant="body2">{noDataMessage}</Typography>
        </Box>
      )}
    </Box>
  );
});
