/**
 * ONLY USED IN LONGVIEW
 * Delete when Lonview is sunsetted, along with AccessibleGraphData
 */
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Chart } from 'chart.js';
import { curry } from 'ramda';
import * as React from 'react';

import { humanizeLargeData } from 'src/components/AreaChart/utils';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { setUpCharts } from 'src/utilities/charts';
import { roundTo } from 'src/utilities/roundTo';

import AccessibleGraphData from './AccessibleGraphData';
import {
  StyledButton,
  StyledButtonElement,
  StyledCanvasContainer,
  StyledContainer,
  StyledWrapper,
} from './LineGraph.styles';

import type { Theme } from '@mui/material/styles';
import type {
  ChartData,
  ChartDataSets,
  ChartOptions,
  ChartTooltipItem,
  ChartXAxe,
} from 'chart.js';
import type { Metrics } from 'src/utilities/statMetrics';

setUpCharts();

export interface DataSet {
  backgroundColor?: string;
  borderColor: string;
  /**
   * The data point to plot on the line graph that should be of type `DataSet`.
   * This data property type might not be the perfect fit, but it works for the data returned from /linodes/:linodeID/stats and /nodebalancers/:nodebalancer/stats.
   */
  data: [number, null | number][];
  // the first number will be a UTC data and the second will be the amount per second
  fill?: boolean | string;
  label: string;
}

export interface LineGraphProps {
  /**
   * `accessibleDataTable` is responsible to both rendering the accessible graph data table and an associated unit.
   */
  accessibleDataTable?: {
    unit: string;
  };
  /**
   * The accessible aria-label for the chart.
   */
  ariaLabel?: string;
  /**
   * The height in `px` of the chart.
   */
  chartHeight?: number;
  /**
   * The data to be plotted on the line graph.
   */
  data: DataSet[];
  /**
   * The function that formats the data point values.
   */
  formatData?: (value: number) => null | number;
  /**
   * The function that formats the tooltip text.
   */
  formatTooltip?: (value: number) => string;

  /**
   * Legend row labels that are used in the legend.
   */
  legendRows?: Array<any>;
  /**
   * Show the native **Chart.js** legend
   */
  nativeLegend?: boolean;
  /**
   * Row headers for the legend.
   */
  rowHeaders?: Array<string>;
  /**
   * Determines whether dates or times are shown on the x-axis and also determines the x-axis step size.
   */
  showToday: boolean;
  /**
   * The suggested maximum y-axis value passed to **Chart,js**.
   */
  suggestedMax?: number;
  /**
   * The suggested maximum y-axis value passed to **Chart,js**.
   */
  tabIndex?: number;

  /**
   * The timezone the graph should use for interpreting the UNIX date-times in the data set.
   */
  timezone: string;
  /**
   * The unit to add to the mouse-over tooltip in the chart.
   */
  unit?: string;
}

const lineOptions: ChartDataSets = {
  borderJoinStyle: 'miter',
  borderWidth: 1,
  lineTension: 0,
  pointHitRadius: 10,
  pointRadius: 0,
};

/**
 * **Chart.js** is the charting tool we use for analytics shown on the Linode detail page
 * - Keep charts compact
 * - When selecting a chart color palette make sure colors are distinct when viewed by a person with color blindness
 * - Test the palette with a checker such as the [Coblis — Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)
 */
export const LineGraph = (props: LineGraphProps) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const inputEl: React.RefObject<any> = React.useRef(null);
  const chartInstance: React.MutableRefObject<any> = React.useRef(null);
  const [legendRendered, setLegendRendered] = React.useState(false);
  const [hiddenDatasets, setHiddenDatasets] = React.useState<number[]>([]);

  const {
    accessibleDataTable,
    ariaLabel,
    chartHeight,
    data,
    formatData,
    formatTooltip,
    legendRows,
    nativeLegend,
    rowHeaders,
    showToday,
    suggestedMax,
    tabIndex,
    timezone,
    unit,
  } = props;

  const finalRowHeaders = rowHeaders ? rowHeaders : ['Max', 'Avg', 'Last'];
  // is undefined on linode/summary
  const plugins = [
    {
      afterDatasetsDraw: () => {
        // hack to force re-render component in order to show legend
        // tested this is called
        if (!legendRendered) {
          setLegendRendered(true);
        }
      },
    },
  ];

  const handleLegendClick = (datasetIndex: number) => {
    if (hiddenDatasets.includes(datasetIndex)) {
      setHiddenDatasets(hiddenDatasets.filter((e) => e !== datasetIndex));
    } else {
      setHiddenDatasets([...hiddenDatasets, datasetIndex]);
    }
  };

  const getChartOptions = (
    _suggestedMax?: number,
    _nativeLegend?: boolean,
    _tooltipUnit?: string
  ) => {
    const finalChartOptions: ChartOptions = {
      animation: { duration: 0 },
      layout: {
        padding: {
          left: 8,
        },
      },
      legend: {
        display: _nativeLegend,
        onClick: (_e, legendItem) => {
          if (legendItem && legendItem.datasetIndex !== undefined) {
            handleLegendClick(legendItem.datasetIndex); // when we click on native legend, also call the handle legend click function
          }
        },
        position: _nativeLegend ? 'bottom' : undefined,
      },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        xAxes: [
          {
            adapters: {
              date: {
                zone: timezone,
              },
            },
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: theme.textColors.tableHeader,
              fontSize: 12,
              fontStyle: 'normal',
            },
            time: {
              displayFormats: showToday
                ? {
                    hour: 'HH:00',
                    minute: 'HH:mm',
                  }
                : {
                    hour: 'LLL dd',
                    minute: 'LLL dd',
                  },
              stepSize: showToday ? 3 : 5,
            },
            type: 'time',
            // This cast is because the type definition does not include adapters
          } as ChartXAxe,
        ],
        yAxes: [
          {
            // Defines a fixed width for the Y-axis labels
            afterFit(axes) {
              axes.width = 35;
            },
            gridLines: {
              borderDash: [3, 6],
              drawTicks: false,
              zeroLineBorderDashOffset: 2,
              zeroLineWidth: 1,
            },
            ticks: {
              beginAtZero: true,
              callback(value: number, _index: number) {
                return humanizeLargeData(value);
              },
              fontColor: theme.textColors.tableHeader,
              fontSize: 12,
              fontStyle: 'normal',
              maxTicksLimit: 8,
              padding: 10,
              suggestedMax: _suggestedMax ?? undefined,
            },
          },
        ],
      },
      tooltips: {
        backgroundColor: theme.tokens.color.Neutrals[5],
        bodyFontColor: theme.tokens.color.Neutrals[90],
        borderColor: theme.tokens.color.Neutrals[50],
        borderWidth: 0.5,
        callbacks: {
          label: _formatTooltip(data, formatTooltip, _tooltipUnit),
        },
        caretPadding: 10,
        cornerRadius: 0,
        displayColors: false,
        intersect: false,
        mode: 'index',
        position: 'nearest',
        titleFontColor: theme.tokens.color.Neutrals[70],
        xPadding: 8,
        yPadding: 10,
      },
    };

    /**
     * We've been given a max unit, which indicates that
     * the data we're looking at is in bytes. We should
     * adjust the tooltip display so that if the maxUnit is GB we
     * display 8MB instead of 0.0000000000000000000000008 GB
     *
     * NOTE: formatTooltip is curried, so here we're creating a new
     * function has the raw data from props bound to it. This is because
     * we need to access the original data to determine what unit to display
     * it in.
     *
     * NOTE2: _maxUnit is the unit that all series on the graph will be converted to.
     * However, in the tooltip, each individual value will be formatted according to
     * the most appropriate unit, if a unit is provided.
     */

    return finalChartOptions as ChartOptions;
  };

  const _formatData = () => {
    return data.map((dataSet, idx) => {
      const timeData = dataSet.data.reduce((acc: any, point: any) => {
        acc.push({
          t: point[0],
          y: formatData ? formatData(point[1]) : point[1],
        });
        return acc;
      }, []);
      return {
        backgroundColor: dataSet.backgroundColor,
        borderColor: dataSet.borderColor,
        data: timeData,
        fill: dataSet.fill,
        hidden: hiddenDatasets.includes(idx),
        label: dataSet.label,
        ...lineOptions,
      };
    });
  };

  React.useEffect(() => {
    // Here we need to wait for the Canvas element to exist to attach a chart to it
    // we use a reference to access it.
    // https://dev.to/vcanales/using-chart-js-in-a-function-component-with-react-hooks-246l
    if (inputEl.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(inputEl.current.getContext('2d'), {
        data: {
          datasets: _formatData(),
        },
        options: getChartOptions(suggestedMax, nativeLegend, unit),
        plugins,
        type: 'line',
      });
    }
  });

  return (
    // Allow `tabIndex` on `<div>` because it represents an interactive element.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex

    // Note on markup and styling: the legend is rendered first for accessibility reasons.
    // Screen readers read from top to bottom, so the legend should be read before the data tables, esp considering their size
    // and the fact that the legend can filter them.
    // Meanwhile the CSS uses column-reverse to visually retain the original order
    <StyledWrapper data-testid="linegraph-wrapper" tabIndex={tabIndex ?? 0}>
      {legendRendered && legendRows && (
        <StyledContainer>
          <Table
            aria-label={`Controls for ${ariaLabel || 'Stats and metrics'}`}
          >
            <TableHead>
              {/* Repeat legend for each data set for mobile */}
              {matchesSmDown ? (
                data.map((section) => (
                  <TableRow key={section.label}>
                    {finalRowHeaders.map((section, i) => (
                      <TableCell data-qa-header-cell key={i}>
                        {section}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell />
                  {finalRowHeaders.map((section, i) => (
                    <TableCell data-qa-header-cell key={i}>
                      {section}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {legendRows?.map((_tick: any, idx: number) => {
                const bgColor = data[idx].backgroundColor;
                const title = data[idx].label;
                const hidden = hiddenDatasets.includes(idx);
                const { data: metricsData, format } = legendRows[idx];
                return (
                  <TableRow key={idx}>
                    <TableCell noWrap>
                      <StyledButton
                        aria-label={`Toggle ${title} visibility`}
                        data-qa-legend-title
                        onClick={() => handleLegendClick(idx)}
                      >
                        <StyledButtonElement
                          sx={{
                            background: bgColor,
                            borderColor: bgColor,
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            height: '18px',
                            marginRight: theme.spacing(1),
                            width: '18px',
                          }}
                          hidden={hidden}
                        />
                        <StyledButtonElement hidden={hidden}>
                          {title}
                        </StyledButtonElement>
                      </StyledButton>
                    </TableCell>
                    {metricsData &&
                      metricsBySection(metricsData).map((section, i) => {
                        return (
                          <TableCell
                            data-qa-body-cell
                            data-qa-graph-column-title={finalRowHeaders[i]}
                            data-qa-graph-row-title={title}
                            key={i}
                          >
                            {format(section)}
                          </TableCell>
                        );
                      })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </StyledContainer>
      )}
      <StyledCanvasContainer>
        <canvas
          aria-label={ariaLabel || 'Stats and metrics'}
          height={chartHeight || 300}
          ref={inputEl}
          role="img"
        />
      </StyledCanvasContainer>
      {accessibleDataTable?.unit && (
        <AccessibleGraphData
          accessibleUnit={accessibleDataTable.unit}
          ariaLabel={ariaLabel}
          chartInstance={chartInstance.current}
          hiddenDatasets={hiddenDatasets}
        />
      )}
    </StyledWrapper>
  );
};

// Grabs the sections we want (max, average, last) and puts them in an array
// so we can map through them and create JSX
export const metricsBySection = (data: Metrics): number[] => [
  data.max,
  data.average,
  data.last,
];

export const _formatTooltip = curry(
  (
    data: DataSet[],
    formatter: ((v: number) => string) | undefined,
    unit: string | undefined,
    t: ChartTooltipItem,
    _d: ChartData
  ) => {
    /**
     * t and d are the params passed by chart.js to this component.
     * data and formatter should be partially applied before this function
     * is called directly by chart.js
     */
    const dataset = t?.datasetIndex ? data[t?.datasetIndex] : data[0];
    const label = dataset.label;
    const val = t?.index !== undefined ? dataset.data[t?.index][1] || 0 : 0; // bug, t?.index if 0, it is considered as false, so added undefined check directly
    const value = formatter ? formatter(val) : roundTo(val);
    return `${label}: ${value}${unit ? unit : ''}`;
  }
);
