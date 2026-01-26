import { Button, CircleProgress, ErrorState, Typography } from '@linode/ui';
import { roundTo } from '@linode/utilities';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { useFlags } from 'src/hooks/useFlags';

import {
  computeLegendRowsBasedOnData,
  computeZoomedInData,
} from '../../Utils/CloudPulseZoomInUtils';
import { humanizeLargeData } from '../../Utils/utils';
import { useZoomController } from './useZoomController';

import type {
  AreaChartProps,
  DataSet,
} from 'src/components/AreaChart/AreaChart';

export interface CloudPulseLineGraph extends AreaChartProps {
  data: DataSet[];
  error?: string;
  loading?: boolean;
  onZoomChange?: (isZoomed: boolean) => void;
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
    ...rest
  } = props;
  const flags = useFlags();

  const theme = useTheme();

  // to reduce the x-axis tick count for small screen
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const isHumanizableUnit =
    flags.aclp?.humanizableUnits?.some(
      (unitElement) => unitElement.toLowerCase() === unit.toLowerCase()
    ) ?? false;

  const isZoomEnabled = flags.aclp?.enableZoomInCharts ?? false; // default to false

  const { zoom, isZoomed, zoomOut, zoomCallbacks } =
    useZoomController(zoomResetKey);

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

  React.useEffect(() => {
    if (onZoomChange) {
      onZoomChange(isZoomed);
    }
  }, [isZoomed, onZoomChange]);

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
              data-qa-buttons
              onClick={zoomOut}
              sx={(theme) => ({
                height: '26px',
                width: '84px',
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
            referenceArea={
              zoom.refAreaLeft !== undefined && zoom.refAreaRight !== undefined
                ? {
                    referenceStart: zoom.refAreaLeft,
                    referenceEnd: zoom.refAreaRight,
                  }
                : null
            }
            showLegend={zoomedData.length > 0 ? showLegend : false}
            tooltipCustomValueFormatter={
              isHumanizableUnit
                ? (value, unit) => `${humanizeLargeData(value)} ${unit}`
                : undefined
            }
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
            zoomCallbacks={isZoomEnabled ? zoomCallbacks : undefined}
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
