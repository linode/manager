import { curry } from 'ramda';
import * as React from 'react';
import {
  Chart,
  LineElement,
  LineController,
  LinearScale,
  PointElement,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-luxon';

import LineChartIcon from 'src/assets/icons/line-chart.svg';
import Button from 'src/components/Button';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { setUpCharts } from 'src/utilities/charts';
import roundTo from 'src/utilities/roundTo';
import { Metrics } from 'src/utilities/statMetrics';
import MetricDisplayStyles from './NewMetricDisplay.styles';
setUpCharts();

Chart.register(
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale
);
export interface DataSet {
  label: string;
  borderColor: string;
  // this data property type might not be the perfect fit, but it works for
  // the data returned from /linodes/:linodeID/stats and
  // /nodebalancers/:nodebalancer/stats
  // the first number will be a UTC data and the second will be the amount per second
  fill?: boolean | string;
  backgroundColor?: string;
  data: [number, number | null][];
}
export interface Props {
  chartHeight?: number;
  showToday: boolean;
  suggestedMax?: number;
  data: DataSet[];
  timezone: string;
  rowHeaders?: Array<string>;
  legendRows?: Array<any>;
  unit?: string;
  nativeLegend?: boolean; // Display chart.js native legend
  formatData?: (value: number) => number | null;
  formatTooltip?: (value: number) => string;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  ...MetricDisplayStyles(theme)
}));

const lineOptions = {
  borderWidth: 1,
  borderJoinStyle: 'miter',
  lineTension: 0,
  pointRadius: 0,
  pointHitRadius: 10
};

const humanizeLargeData = (value: number) => {
  if (value >= 1000000) {
    return value / 1000000 + 'M';
  }
  if (value >= 1000) {
    return value / 1000 + 'K';
  }
  return value;
};

const LineGraph: React.FC<CombinedProps> = (props: CombinedProps) => {
  const inputEl: React.RefObject<any> = React.useRef(null);
  const chartInstance: React.MutableRefObject<any> = React.useRef(null);
  const [legendRendered, setLegendRendered] = React.useState(false);
  const [hiddenDatasets, setHiddenDatasets] = React.useState<number[]>([]);

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down(960));

  const {
    chartHeight,
    formatData,
    formatTooltip,
    suggestedMax,
    showToday,
    timezone,
    data,
    rowHeaders,
    legendRows,
    nativeLegend,
    unit
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
      }
    }
  ];

  const handleLegendClick = (datasetIndex: number) => {
    if (hiddenDatasets.includes(datasetIndex)) {
      setHiddenDatasets(hiddenDatasets.filter(e => e !== datasetIndex));
    } else {
      setHiddenDatasets([...hiddenDatasets, datasetIndex]);
    }
  };

  const getChartOptions = (
    _suggestedMax?: number,
    _nativeLegend?: boolean,
    _tooltipUnit?: string
  ) => {
    return {
      maintainAspectRatio: false,
      responsive: true,
      animation: { duration: 0 },
      legend: {
        display: _nativeLegend,
        position: _nativeLegend ? 'bottom' : undefined
      },
      scales: {
        y: {
          gridLines: {
            borderDash: [3, 6],
            zeroLineWidth: 1,
            zeroLineBorderDashOffset: 2
          },
          suggestedMax: _suggestedMax ?? undefined,

          beginAtZero: true,
          ticks: {
            callback(value: number, _index: number) {
              return humanizeLargeData(value);
            }
          }
        },

        x: {
          type: 'time',
          gridLines: {
            display: false
          },
          time: {
            stepSize: showToday ? 3 : 5,
            displayFormats: showToday
              ? {
                  hour: 'HH:00',
                  minute: 'HH:mm'
                }
              : {
                  hour: 'LLL dd',
                  minute: 'LLL dd'
                }
          },
          adapters: {
            date: {
              zone: timezone
            }
          }
        }
      },
      tooltip: {
        cornerRadius: 0,
        backgroundColor: '#fbfbfb',
        bodyFontColor: '#32363C',
        displayColors: false,
        titleFontColor: '#606469',
        xPadding: 16,
        yPadding: 10,
        borderWidth: 0.5,
        borderColor: '#999',
        caretPadding: 10,
        position: 'nearest',
        callbacks: {
          label: _formatTooltip(data, formatTooltip, _tooltipUnit)
        },
        intersect: false,
        mode: 'index'
      }
    };
  };

  const _formatData = () => {
    return data.map((dataSet, idx) => {
      const timeData = dataSet.data.reduce((acc: any, point: any) => {
        acc.push({
          x: point[0],
          y: formatData ? formatData(point[1]) : point[1]
        });
        return acc;
      }, []);
      return {
        label: dataSet.label,
        borderColor: dataSet.borderColor,
        backgroundColor: dataSet.backgroundColor,
        fill: dataSet.backgroundColor,
        data: timeData,
        hidden: hiddenDatasets.includes(idx),
        ...lineOptions
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
      const datasets = _formatData();
      chartInstance.current = new Chart(inputEl.current.getContext('2d'), {
        type: 'line',
        data: {
          datasets
        },
        plugins,
        options: getChartOptions(suggestedMax, nativeLegend, unit)
      });
      console.log(chartInstance.current.getDatasetMeta(0));
    }
  });
  return (
    <div className={classes.wrapper}>
      <div style={{ width: '100%' }}>
        <canvas height={chartHeight || 300} ref={inputEl} />
      </div>
      {legendRendered && legendRows && (
        <div className={classes.container}>
          <Table aria-label="Stats and metrics" className={classes.root}>
            <TableHead className={classes.tableHead}>
              {/* Remove "Toggle Graph" label and repeat legend for each data set for mobile */}
              {matchesSmDown ? (
                data.map(section => (
                  <TableRow key={section.label}>
                    {finalRowHeaders.map((section, i) => (
                      <TableCell
                        key={i}
                        data-qa-header-cell
                        className={classes.tableHeadInner}
                      >
                        <Typography variant="body2" className={classes.text}>
                          {section}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className={classes.tableHeadInner}>
                    <Typography
                      variant="body2"
                      component="span"
                      className={classes.text}
                    >
                      Toggle Graphs
                    </Typography>
                    <LineChartIcon className={classes.chartIcon} />
                  </TableCell>
                  {finalRowHeaders.map((section, i) => (
                    <TableCell
                      key={i}
                      data-qa-header-cell
                      className={classes.tableHeadInner}
                    >
                      <Typography variant="body2" className={classes.text}>
                        {section}
                      </Typography>
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
                    <TableCell className={classes.legend}>
                      <Button
                        onClick={() => handleLegendClick(idx)}
                        data-qa-legend-title
                        aria-label={`Toggle ${title} visibility`}
                        className={classes.toggleButton}
                      >
                        <div
                          className={`${classes.legendIcon} ${hidden &&
                            classes.crossedOut}`}
                          style={{
                            background: bgColor,
                            borderColor: bgColor
                          }}
                        />
                        <span className={hidden ? classes.crossedOut : ''}>
                          {title}
                        </span>
                      </Button>
                    </TableCell>
                    {metricsData &&
                      metricsBySection(metricsData).map((section, i) => {
                        return (
                          <TableCell
                            key={i}
                            parentColumn={
                              rowHeaders ? rowHeaders[idx] : undefined
                            }
                            data-qa-body-cell
                          >
                            <Typography
                              variant="body2"
                              className={classes.text}
                            >
                              {format(section)}
                            </Typography>
                          </TableCell>
                        );
                      })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// Grabs the sections we want (max, average, last) and puts them in an array
// so we can map through them and create JSX
export const metricsBySection = (data: Metrics): number[] => [
  data.max,
  data.average,
  data.last
];

export const _formatTooltip = curry(
  (
    data: DataSet[],
    formatter: ((v: number) => string) | undefined,
    unit: string | undefined,
    t: any,
    _d: any
  ) => {
    /**
     * t and d are the params passed by chart.js to this component.
     * data and formatter should be partially applied before this function
     * is called directly by chart.js
     */
    const dataset = t?.datasetIndex ? data[t?.datasetIndex] : data[0];
    const label = dataset.label;
    const val = t?.index ? dataset.data[t?.index][1] || 0 : 0;
    const value = formatter ? formatter(val) : roundTo(val);
    return `${label}: ${value}${unit ? unit : ''}`;
  }
);

export default LineGraph;
