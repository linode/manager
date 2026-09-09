import { Button, CircleProgress, ErrorState, Typography } from '@linode/ui';
import { Box } from '@mui/material';
import * as React from 'react';

import { BarChart } from 'src/components/BarChart/BarChart';

import { CloudPulseTooltip } from './CloudPulseTooltip';
import { useCloudPulseChartInteractions } from './useCloudPulseChartInteractions';

import type { CloudPulseGraphPickerProps } from './chartTypes';

export const CloudPulseBarChart = React.memo(
  (props: CloudPulseGraphPickerProps) => {
    const {
      areas: bars,
      error,
      loading,
      unit,
      data,
      legendRows,
      zoomResetKey,
      onZoomChange,
      showLegend,
      widgetLabel,
      onHiddenDataPlotChanges: onHiddenAreasChange,
      ...rest
    } = props;
    const { axis, tooltip, zoom } = useCloudPulseChartInteractions({
      plots: bars,
      data,
      legendRows,
      onZoomChange,
      unit,
      zoomResetKey,
    });

    const { isSmallScreen, yAxisProps } = axis;
    const {
      activeDotHandlers,
      chartContainerRef,
      colorMap: barsColorMap,
      isCustomTooltipEnabled,
      isTooltipVisible,
      recalculate,
      tooltipCustomValueFormatter,
      tooltipEntriesByTimestamp,
      tooltipFilter,
      tooltipMaxHeight,
      tooltipMouseHandlers,
      tooltipPos,
      tooltipRef,
    } = tooltip;
    const {
      chartCallbacks: zoomCallbackHandlers,
      data: zoomedData,
      isZoomed,
      legendRows: zoomedLegendRows,
      resetZoom,
      state: zoomState,
    } = zoom;

    if (loading) {
      return <CircleProgress sx={{ minHeight: '380px' }} />;
    }

    if (error) {
      return <ErrorState errorText={error} />;
    }
    return (
      <Box
        sx={{
          p: 2,
          position: 'relative',
        }}
      >
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
          <BarChart
            {...rest}
            areas={bars}
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
                    dataColorMap: barsColorMap,
                    tooltipEntriesByTimestamp,
                    tooltipWrapperStyle: {
                      maxHeight: `${tooltipMaxHeight}px`,
                      overflow: 'hidden',
                      minHeight: '44px',
                      maxWidth: '300px',
                      minWidth: '190px',
                      contain: 'layout',
                    },
                    activeDotHandlers,
                    isTooltipVisible,
                    onFilteredTooltipChange: recalculate,
                    tooltipFilter,
                  }
                : undefined
            }
            data={zoomedData}
            legendHeight="165px"
            legendRows={zoomedLegendRows}
            margin={{
              bottom: 0,
              left: -15,
              right: 30,
              top: 2,
            }}
            onHiddenDataPlotsChange={onHiddenAreasChange}
            referenceArea={
              zoomState.refAreaLeft !== undefined &&
              zoomState.refAreaRight !== undefined
                ? {
                    referenceStart: zoomState.refAreaLeft,
                    referenceEnd: zoomState.refAreaRight,
                  }
                : null
            }
            showLegend={zoomedData.length > 0 ? showLegend : false}
            tooltipCustomValueFormatter={tooltipCustomValueFormatter}
            tooltipPosition={tooltipPos}
            tooltipRef={tooltipRef}
            unit={unit}
            xAxisTickCount={
              isSmallScreen ? undefined : Math.min(zoomedData.length, 7)
            }
            yAxisProps={yAxisProps}
          />
        </Box>

        {zoomedData.length === 0 && (
          <Box
            sx={{
              bottom: '50%',
              left: '45%',
              position: 'absolute',
            }}
          >
            <Typography variant="body2">No data to display</Typography>
          </Box>
        )}
      </Box>
    );
  }
);
