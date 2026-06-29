import { roundTo } from '@akamai/compute-ui-core/formatting';
import { Box, useTheme } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import * as React from 'react';

import { AreaChart } from 'src/components/AreaChart/AreaChart';
import { useFlags } from 'src/hooks/useFlags';
import { themes } from 'src/utilities/theme';

import { useCloudPulseContext } from '../../Context/useCloudPulseContext';
import { svgToDataURL } from '../../Dashboard/pdf/utils/imageUtils';
import {
  computeLegendRowsBasedOnData,
  computeZoomedInData,
} from '../../Utils/CloudPulseZoomInUtils';
import { humanizeLargeData } from '../../Utils/utils';

import type { CloudPulseLineGraph } from './CloudPulseLineGraph';

export interface CloudPulseGraphPdfProps extends CloudPulseLineGraph {
  /**
   * The error text to display in the PDF if the graph fails to load or render
   */
  errorText?: string;
  /**
   * The filter string to display in the PDF, representing the applied filters for this graph
   */
  filterString: string;
  /**
   * Hidden Legend rows to be used for PDF export. This allows the PDF to reflect the same legend state as the on-screen graph.
   */
  hiddenLegendRows?: string[];
  /**
   * The resources | entities selected
   */
  resourceLabels?: string;

  /**
   * The original widget label (without unit) to identify the corresponding SVG for PDF export
   */
  widgetLabel: string;

  /**
   * The widget label with unit, used for display in the PDF
   */
  widgetLabelWithUnit: string;

  /**
   * The zoom range to apply when rendering the graph for PDF export. This allows the PDF to reflect the same zoomed-in view as the on-screen graph.
   */
  zoomRange?: {
    left: 'dataMin' | number;
    right: 'dataMax' | number;
  };
}

/**
 * Hidden full-size graph component for PDF export
 * Computes zoomed data based on zoomRange passed from parent
 */
export const CloudPulseGraphPdfWrapper = React.memo(
  (props: CloudPulseGraphPdfProps) => {
    const {
      unit,
      data,
      legendRows,
      widgetLabel,
      widgetLabelWithUnit,
      filterString,
      errorText,
      zoomRange,
      loading,
      areas,
      resourceLabels,
      hiddenLegendRows,
      ...rest
    } = props;
    const { setDashboardPdfData } = useCloudPulseContext();
    const flags = useFlags();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const containerRef = React.useRef<HTMLDivElement>(null);

    const isHumanizableUnit = React.useMemo(
      () =>
        flags.aclp?.humanizableUnits?.some(
          (unitElement) => unitElement.toLowerCase() === unit.toLowerCase()
        ) ?? false,
      [flags.aclp?.humanizableUnits, unit]
    );

    const filteredAreas = React.useMemo(() => {
      if (!areas || !hiddenLegendRows) {
        return areas;
      }
      return areas.filter((area) => !hiddenLegendRows?.includes(area.dataKey));
    }, [areas, hiddenLegendRows]);

    // Compute zoomed data based on zoomRange
    const zoomedData = React.useMemo(() => {
      if (!zoomRange || data.length === 0) {
        return data;
      }
      return computeZoomedInData({
        data,
        zoom: { left: zoomRange.left, right: zoomRange.right },
      });
    }, [data, zoomRange]);

    const zoomedLegendRows = React.useMemo(() => {
      if (!zoomRange || !legendRows || legendRows.length === 0) {
        return legendRows;
      }
      return computeLegendRowsBasedOnData({
        zoom: { left: zoomRange.left, right: zoomRange.right },
        data: zoomedData,
        legendRows,
        unit,
        isHumanizableUnit,
      });
    }, [zoomRange, legendRows, zoomedData, unit, isHumanizableUnit]);

    React.useEffect(() => {
      // Wait a beat to ensure Recharts/UI has painted the SVG
      requestAnimationFrame(async () => {
        const svgNode = containerRef.current?.querySelector(
          `svg[aria-label="${widgetLabel}-pdf"]`
        );

        setDashboardPdfData({
          filterString,
          graphSVG:
            svgNode && svgNode instanceof SVGElement
              ? await svgToDataURL(svgNode)
              : null,
          legendRowData: zoomedLegendRows ?? [],
          widgetLabel,
          widgetLabelWithUnit,
          errorText,
          loading: loading ?? false,
          hiddenLegendRows: hiddenLegendRows ?? [],
          resourceLabels,
        });
      });
    }, [
      errorText,
      filterString,
      hiddenLegendRows,
      loading,
      setDashboardPdfData,
      widgetLabel,
      widgetLabelWithUnit,
      zoomedLegendRows,
      zoomedData,
      resourceLabels,
    ]);

    return (
      <ThemeProvider theme={themes.light}>
        <Box
          data-testid="cloud-pulse-graph-pdf-wrapper"
          ref={containerRef}
          style={{ width: '100%', height: '100%' }}
        >
          <AreaChart
            {...rest}
            areas={filteredAreas}
            ariaLabel={`${widgetLabel}-pdf`}
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
            showLegend={false}
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
          />
        </Box>
      </ThemeProvider>
    );
  }
);
