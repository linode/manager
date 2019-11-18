import * as moment from 'moment-timezone';
import { clone, curry } from 'ramda';
import * as React from 'react';
import { ChartData, Line } from 'react-chartjs-2';
import { setUpCharts } from 'src/utilities/charts';

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
  data: [number, number][];
}

export interface Props {
  chartHeight?: number;
  showToday: boolean;
  suggestedMax?: number;
  data: DataSet[];
  timezone: string;
  unit?: string; // Display unit on Y axis ticks
}

type CombinedProps = Props;

const chartOptions: any = {
  maintainAspectRatio: false,
  animation: {
    duration: 0
  },
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

class LineGraph extends React.Component<CombinedProps, {}> {
  getChartOptions = (suggestedMax?: number, unit?: string) => {
    const finalChartOptions = clone(chartOptions);
    const { showToday, timezone } = this.props;
    const parser = parseInTimeZone(timezone || '');
    finalChartOptions.scales.xAxes[0].time.parser = parser;
    finalChartOptions.scales.xAxes[0].time.offset = moment
      .tz(timezone || '')
      .utcOffset();

    if (showToday) {
      finalChartOptions.scales.xAxes[0].time.displayFormats = {
        hour: 'HH:00',
        minute: 'HH:00'
      };
    } else {
      finalChartOptions.scales.xAxes[0].time.displayFormats = {
        hour: 'MMM DD',
        minute: 'MMM DD'
      };
    }

    if (suggestedMax) {
      finalChartOptions.scales.yAxes[0].ticks.suggestedMax = suggestedMax;
    }

    if (unit) {
      finalChartOptions.scales.yAxes[0].ticks.callback = (
        value: number,
        index: number
      ) => `${humanizeLargeData(value)}${unit}`;
    }

    return finalChartOptions;
  };

  formatData = () => {
    const { data } = this.props;

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

  render() {
    const { chartHeight, unit, suggestedMax } = this.props;
    return (
      <Line
        height={chartHeight || 300}
        options={this.getChartOptions(suggestedMax, unit)}
        data={{
          datasets: this.formatData()
        }}
      />
    );
  }
}

export default LineGraph;
