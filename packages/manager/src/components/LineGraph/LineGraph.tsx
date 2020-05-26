import { curry } from 'ramda';
import * as React from 'react';
import {ChartDataSets, ChartOptions, Chart, ChartTooltipItem, ChartData} from 'chart.js';
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
import roundTo from 'src/utilities/roundTo';
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
  unit?: string;
  nativeLegend?: boolean; // Display chart.js native legend
  formatData?: (value: number) => number | null;
  formatTooltip?: (value: number) => string;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  ...MetricDisplayStyles(theme)
}));


const lineOptions: ChartDataSets = {
  borderWidth: 1,
  borderJoinStyle: 'miter',
  lineTension: 0,
  pointRadius: 0,
  pointHitRadius: 10
};

// const parseInTimeZone = curry((timezone: string, utcMoment: any) => {
  
//   const res =  DateTime.fromMillis(utcMoment);
//   console.log('parseInTimeZone', utcMoment, res)
//   return res
// });

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
  const inputEl: React.RefObject<any> = React.useRef(null);
  const [legendRendered, setLegendRendered] = React.useState(false);
  const [hiddenDatasets, setHiddenDatasets] = React.useState<Number[]>([]);
  // const [, forceUpdate] = React.useState();
  const classes = useStyles();
  const {
    chartHeight,
    formatData,
    formatTooltip,
    suggestedMax,
    showToday,
    // timezone,
    data,
    rowHeaders,
    legendRows,
    nativeLegend,
    unit
    // ...rest
  } = props;
  const finalRowHeaders = rowHeaders ? rowHeaders : ['Max', 'Avg', 'Last'];
  // is undefined on linode/summary
  //AC, after testing with and without this, 
  //i do not see a difference, maybe could be removed at some point
  const plugins = [
    {
      afterDatasetsDraw:()=> {
        // hack to force re-render component in order to show legend
        //tested this is called
          // console.log('legend rendered ? set')
        if (!legendRendered) {
          // console.log('legend rendered set')
          setLegendRendered(true);
        }
      }
    }
  ];

  const handleLegendClick = (datasetIndex: number) => {
    if(hiddenDatasets.includes(datasetIndex)){
      setHiddenDatasets( hiddenDatasets.filter(e=>e!==datasetIndex))
    }else{
      setHiddenDatasets([...hiddenDatasets, datasetIndex])
    }
  };

  const getChartOptions = (
    _suggestedMax?: number,
    _nativeLegend?: boolean,
    _tooltipUnit?: string
  ) => {
    let finalChartOptions: ChartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      animation: undefined,
      legend: {
        display: _nativeLegend,
        position:_nativeLegend? 'bottom':undefined
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
              suggestedMax:_suggestedMax??undefined,
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
              stepSize:showToday?3:5,
              displayFormats: showToday?{
                hour: 'HH:00',
                minute: 'HH:mm'
              }:{
                hour:'MMM DD',
                minute:'MMM DD'
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
        position: 'nearest',
        callbacks: {
          label:_formatTooltip(
            data,
          formatTooltip,
          _tooltipUnit
          )
        },
        intersect: false,
        mode: 'index'
      }
    };
        // const parser = parseInTimeZone(timezone || '');
    // finalChartOptions.scales.xAxes[0].time.parser = parser;
    // AC, seems useless, it depends on our own modification of chartjs with a patch
    // finalChartOptions.scales.xAxes[0].time.offset = DateTime.local()
    //   .setZone(timezone || '').zone.offset();


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

    return finalChartOptions;
  };

  const _formatData = () => {
    return data.map((dataSet,idx) => {
      const timeData = dataSet.data.reduce((acc: any, point: any) => {
        acc.push({
          t: point[0],
          y: formatData ? formatData(point[1]) : point[1]
        });
        return acc;
      }, []);

      return {
        label: dataSet.label,
        borderColor: dataSet.borderColor,
        backgroundColor: dataSet.backgroundColor,
        data: timeData,
        fill: dataSet.fill,
        hidden:hiddenDatasets.includes(idx),
        ...lineOptions
      };
    });
  };


  React.useEffect(() => {
    if (inputEl.current) {
      new Chart(inputEl.current.getContext('2d'), {
        type: "line",
        data: {
            datasets: _formatData()
        },plugins,
        options: getChartOptions(suggestedMax, nativeLegend, unit)
      });


    }
  });
  return (
    <div className={classes.wrapper}>
      <div style={{ width: '100%' }}>
      <canvas
      height={chartHeight || 300}
                    // id="myChart"
                    ref={inputEl}
                />
        {/* <Line
          {...rest}
          height={chartHeight || 300}
          options={getChartOptions(suggestedMax, nativeLegend, unit)}
          plugins={plugins}
          ref={inputEl}
          data={{
            datasets: _formatData()
          }}
        /> */}
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
                      {section}CPU
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <React.Fragment>
                {
                  // legendRows && inputEl.current.chartInstance &&
                  // inputEl.current.chartInstance.legend.legendItems.map(
                    legendRows?.map(
                    (tick: any, idx: number) => {
                      const bgColor = data[idx].backgroundColor
                      // AC removed in refactor seems useless
                      //  string =
                      //   typeof tick.fillStyle === 'string'
                      //     ? tick.fillStyle
                      //     : 'transparent';
                      const title = data[idx].label
                      const { data: metricsData, format } = legendRows[idx];
                      return (
                        <TableRow key={idx}>
                          <TableCell className={classes.legend}>
                            <Button
                              onClick={() =>
                                handleLegendClick(idx)
                              }
                              data-qa-legend-title
                              aria-label={`Toggle ${title} visibility`}
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

export const _formatTooltip = curry(
  (
    data: DataSet[],
    formatter: ((v: number) => string) | undefined,
    unit: string | undefined,
    t: ChartTooltipItem,
    d: ChartData
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
