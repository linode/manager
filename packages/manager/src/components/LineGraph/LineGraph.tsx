import * as moment from 'moment-timezone';
import { clone, curry } from 'ramda';
import * as React from 'react';
import { ChartData, Line } from 'react-chartjs-2';
import LineChartIcon from 'src/assets/icons/line-chart.svg';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { setUpCharts } from 'src/utilities/charts';
import { Metrics } from 'src/utilities/statMetrics';
import MetricDisplayStyles from './NewMetricDisplay.styles';
setUpCharts();

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
  unit?: string; // Display unit on Y axis ticks
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  ...MetricDisplayStyles(theme)
}));

const chartOptions: any = {
  maintainAspectRatio: false,
  responsive: true,
  animation: false,
  legend: {
    display: false
  },
  scales: {
    yAxes: [
      {
        gridLines: {
          borderDash: [3, 6],
          zeroLineWidth: 1,
          zeroLineBorderDashOffset: 2
        },
        ticks: {
          beginAtZero: true,
          callback(value: number, index: number) {
            return humanizeLargeData(value);
          }
        }
      }
    ],
    xAxes: [
      {
        type: 'time',
        gridLines: {
          display: false
        },
        time: {
          unit: 'hour',
          unitStepSize: 3,
          displayFormats: {
            hour: 'HH:00',
            minute: 'HH:00'
          }
        }
      }
    ]
  },
  tooltips: {
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
    position: 'nearest'
  }
};

const lineOptions: ChartData<any> = {
  borderWidth: 1,
  borderJoinStyle: 'miter',
  lineTension: 0,
  pointRadius: 0,
  pointHitRadius: 10
};

const parseInTimeZone = curry((timezone: string, utcMoment: any) => {
  return moment(utcMoment).tz(timezone);
});

const humanizeLargeData = (value: number) => {
  if (value >= 1000000) {
    return value / 1000000 + 'M';
  }
  if (value >= 1000) {
    return value / 1000 + 'K';
  }
  return value;
};

const LineGraph: React.FC<CombinedProps> = props => {
  const inputEl: any = React.useRef(null);
  const [legendRendered, setLegendRendered] = React.useState(false);
  const [, forceUpdate] = React.useState();
  const classes = useStyles();
  const {
    chartHeight,
    unit,
    suggestedMax,
    showToday,
    timezone,
    data,
    rowHeaders,
    legendRows,
    ...rest
  } = props;
  const finalRowHeaders = rowHeaders ? rowHeaders : ['Max', 'Avg', 'Last'];

  const handleLegendClick = (datasetIndex: number) => {
    const chart = inputEl.current.chartInstance;
    chart.getDatasetMeta(datasetIndex).hidden =
      chart.getDatasetMeta(datasetIndex).hidden === null
        ? true
        : !chart.getDatasetMeta(datasetIndex).hidden;
    chart.update(); // re-draw chart to hide dataset
    forceUpdate({}); // re-draw component to update legend styles
  };

  const plugins = [
    {
      afterDatasetsDraw() {
        // hack to force re-render component in order to show legend
        if (!legendRendered) {
          setLegendRendered(true);
        }
      }
    }
  ];

  const getChartOptions = (_suggestedMax?: number, _unit?: string) => {
    const finalChartOptions = clone(chartOptions);
    const parser = parseInTimeZone(timezone || '');
    finalChartOptions.scales.xAxes[0].time.parser = parser;
    finalChartOptions.scales.xAxes[0].time.offset = moment
      .tz(timezone || '')
      .utcOffset();

    if (showToday) {
      finalChartOptions.scales.xAxes[0].time.displayFormats = {
        hour: 'HH:00',
        minute: 'HH:mm'
      };
    } else {
      finalChartOptions.scales.xAxes[0].time.displayFormats = {
        hour: 'MMM DD',
        minute: 'MMM DD'
      };
    }

    if (_suggestedMax) {
      finalChartOptions.scales.yAxes[0].ticks.suggestedMax = _suggestedMax;
    }

    if (_unit) {
      finalChartOptions.scales.yAxes[0].ticks.callback = (
        value: number,
        index: number
      ) => `${humanizeLargeData(value)}${_unit}`;
    }

    return finalChartOptions;
  };

  const formatData = () => {
    return data.map(dataSet => {
      const timeData = dataSet.data.reduce((acc: any, point: any) => {
        acc.push({ t: point[0], y: point[1] });
        return acc;
      }, []);

      return {
        label: dataSet.label,
        borderColor: dataSet.borderColor,
        backgroundColor: dataSet.backgroundColor,
        data: timeData,
        fill: dataSet.fill,
        ...lineOptions
      };
    });
  };

  return (
    <div className={classes.wrapper}>
      <div>
        <Line
          {...rest}
          height={chartHeight || 300}
          options={getChartOptions(suggestedMax, unit)}
          plugins={plugins}
          ref={inputEl}
          data={{
            datasets: formatData()
          }}
        />
      </div>
      {legendRendered && legendRows && (
        <div className={classes.container}>
          <Table aria-label="Stats and metrics" className={classes.root}>
            <TableHead>
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
            </TableHead>
            <TableBody>
              <React.Fragment>
                {legendRows &&
                  inputEl.current.chartInstance.legend.legendItems.map(
                    (tick: any, idx: number) => {
                      const bgColor: string =
                        typeof tick.fillStyle === 'string'
                          ? tick.fillStyle
                          : 'transparent';
                      const { rowData, format } = legendRows[idx];
                      return (
                        <TableRow key={idx}>
                          <TableCell className={classes.legend}>
                            <Button
                              onClick={() =>
                                handleLegendClick(tick.datasetIndex)
                              }
                              data-qa-legend-title
                              aria-label="Toggle Chart Visibility"
                              className={classes.toggleButton}
                            >
                              <div
                                className={`${
                                  classes.legendIcon
                                } ${tick.hidden && classes.crossedOut}`}
                                style={{
                                  background: bgColor,
                                  borderColor: bgColor
                                }}
                              />
                              <span
                                className={
                                  tick.hidden ? classes.crossedOut : ''
                                }
                              >
                                {tick.text}
                              </span>
                            </Button>
                          </TableCell>
                          {rowData &&
                            metricsBySection(rowData).map((section, i) => {
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
                    }
                  )}
              </React.Fragment>
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

export default LineGraph;
