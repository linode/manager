import * as React from 'react';
import Axios from 'axios';
import { Line } from 'react-chartjs-2';

import { withStyles, StyleRulesCallback, WithStyles } from 'material-ui';

import { API_ROOT } from 'src/constants';
import transitionStatus from 'src/features/linodes/linodeTransitionStatus';
import ExpansionPanel from 'src/components/ExpansionPanel';

import LinodeTheme from 'src/theme';
import LinodeBusyStatus from './LinodeBusyStatus';
import SummaryPanel from './SummaryPanel';

type ClassNames = 'container'
  | 'chart'
  | 'leftLegend'
  | 'bottomLegend'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow';

interface Props {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes: Linode.Volume[];
}

interface State {
  stats: Linode.TodoAny;
}

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  return {
    container: {
      position: 'relative',
    },
    chart: {
      paddingLeft: theme.spacing.unit * 4,
    },
    leftLegend: {
      position: 'absolute',
      left: -8,
      bottom: 72,
      transform: 'rotate(-90deg)',
      color: '#777',
      fontSize: 14,
    },
    bottomLegend: {
      margin: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px ${theme.spacing.unit}px`,
      display: 'flex',
      color: '#777',
      fontSize: 14,
      '& > div': {
        display: 'flex',
        marginRight: theme.spacing.unit * 5,
        '&:before': {
          content: '""',
          display: 'block',
          width: 20,
          height: 20,
          marginRight: theme.spacing.unit,
        },
      },
    },
    blue: {
      '&:before': {
        backgroundColor: LinodeTheme.palette.primary.main,
      },
    },
    green: {
      '&:before': {
        backgroundColor: LinodeTheme.color.green,
      },
    },
    red: {
      '&:before': {
        backgroundColor: LinodeTheme.color.red,
      },
    },
    yellow: {
      '&:before': {
        backgroundColor: LinodeTheme.color.yellow,
      },
    },
  };
};

type CombinedProps = Props & WithStyles<ClassNames>;

const chartOptions = {
  maintainAspectRatio: false,
  animation: {
    duration: 0,
  },
  legend: {
    display: false,
  },
  scales: {
    yAxes: [{
      gridLines: {
        borderDash: [3, 6],
        zeroLineWidth: 1,
        zeroLineBorderDashOffset: 2,
      },
      ticks: {
        callback(value: number, index: number) {
          if (value >= 1000000) {
            return (value / 1000000) + 'M';
          }
          if (value >= 1000) {
            return (value / 1000) + 'K';
          }
          return value;
        },
      },
    }],
    xAxes: [{
      type: 'time',
      gridLines: {
        display: false,
      },
      time: {
        displayFormats: {
          hour: 'HH:00',
          minute: 'HH:00',
        },
      },
    }],
  },
};

const lineOptions = {
  backgroundColor: 'rgba(0, 0, 0, 0)',
  borderWidth: 1,
  borderJoinStyle: 'miter',
  lineTension: 0,
  pointRadius: 0,
  pointHitRadius: 5,
};

const statToLabel = {
  cpu: 'CPU %',
  netv4: 'IPv4 Traffic',
  netv6: 'IPv6 Traffic',
  in: 'Public Traffic In',
  out: 'Public Traffic Out',
  private_in: 'Private Traffic In',
  private_out: 'Private Traffic Out',
  io: 'Disk I/O',
  swap: 'Swap I/O',
};

const statToColor = {
  cpu: '#428ade',
  in: '#3683dc',
  out: '#01b159',
  private_in: '#d01e1e',
  private_out: '#ffd100',
  io: '#ffd100',
  swap: '#d01e1e',
};

class LinodeSummary extends React.Component<CombinedProps, State> {
  state: State = {
    stats: undefined,
  };

  getStats() {
    const { linode } = this.props;
    Axios.get(`${API_ROOT}/linode/instances/${linode.id}/stats`)
      .then(response => this.setState({ stats: response.data }));
  }

  componentDidMount() {
    this.getStats();
    window.setInterval(() => this.getStats(), 20000);
  }

  getChartJSDataFor(stat: string, data: [number, number][]) {
    const timeData = data.reduce((acc: any, point: any) => {
      acc.push({ t: point[0], y: point[1] });
      return acc;
    }, []);

    return {
      label: statToLabel[stat],
      borderColor: statToColor[stat],
      data: timeData,
      ...lineOptions,
    };
  }

  render() {
    const { linode, type, image, volumes, classes } = this.props;
    const { stats } = this.state;
    return (
      <React.Fragment>
        {transitionStatus.includes(linode.status) &&
          <LinodeBusyStatus linode={linode} />
        }
        <SummaryPanel linode={linode} type={type} image={image} volumes={volumes} />

        <ExpansionPanel
          heading={statToLabel.cpu}
          defaultExpanded={true}
        >
          {stats &&
            <React.Fragment>
              <div className={classes.container}>
                <div className={classes.leftLegend}>
                  CPU %
                </div>
                <div className={classes.chart}>
                  <Line
                    height={300}
                    options={chartOptions}
                    data={{
                      datasets: [
                        this.getChartJSDataFor('cpu', stats.data.cpu) as any,
                      ],
                    }}
                  />
                </div>
                <div className={classes.bottomLegend}>
                  <div className={classes.blue}>
                    CPU %
                  </div>
                </div>
              </div>
            </React.Fragment>
          }
        </ExpansionPanel>

        <ExpansionPanel
          heading="IPv4 Traffic"
        >
          {stats &&
            <React.Fragment>
              <div className={classes.container}>
                <div className={classes.leftLegend}>
                  bits/sec
                </div>
                <div className={classes.chart}>
                  <Line
                    height={300}
                    options={chartOptions}
                    data={{
                      datasets: [
                        this.getChartJSDataFor('in', stats.data.netv4.in) as any,
                        this.getChartJSDataFor('out', stats.data.netv4.out) as any,
                        this.getChartJSDataFor('private_in', stats.data.netv4.private_in) as any,
                        this.getChartJSDataFor('private_out', stats.data.netv4.private_out) as any,
                      ],
                    }}
                  />
                </div>
                <div className={classes.bottomLegend}>
                  <div className={classes.blue}>
                    Public IPv4 Inbound
                  </div>
                  <div className={classes.green}>
                    Public IPv4 Outbound
                  </div>
                  <div className={classes.red}>
                    Private IPv4 Inbound
                  </div>
                  <div className={classes.yellow}>
                    Private IPv4 Outbound
                  </div>
                </div>
              </div>
            </React.Fragment>
          }
        </ExpansionPanel>

        <ExpansionPanel
          heading="IPv6 Traffic"
        >
          {stats &&
            <React.Fragment>
              <div className={classes.container}>
                <div className={classes.leftLegend}>
                  bits/sec
                </div>
                <div className={classes.chart}>
                  <Line
                    height={300}
                    options={chartOptions}
                    data={{
                      datasets: [
                        this.getChartJSDataFor('in', stats.data.netv6.in) as any,
                        this.getChartJSDataFor('out', stats.data.netv6.out) as any,
                        this.getChartJSDataFor('private_in', stats.data.netv6.private_in) as any,
                        this.getChartJSDataFor('private_out', stats.data.netv6.private_out) as any,
                      ],
                    }}
                  />
                </div>
                <div className={classes.bottomLegend}>
                  <div className={classes.blue}>
                    Public IPv6 Inbound
                  </div>
                  <div className={classes.green}>
                    Public IPv6 Outbound
                  </div>
                  <div className={classes.red}>
                    Private IPv6 Inbound
                  </div>
                  <div className={classes.yellow}>
                    Private IPv6 Outbound
                  </div>
                </div>
              </div>
            </React.Fragment>
          }
        </ExpansionPanel>

        <ExpansionPanel
          heading="Disk I/O"
        >
          {stats &&
            <React.Fragment>
              <div className={classes.container}>
                <div className={classes.leftLegend}>
                  blocks/sec
                </div>
                <div className={classes.chart}>
                  <Line
                    height={300}
                    options={chartOptions}
                    data={{
                      datasets: [
                        this.getChartJSDataFor('io', stats.data.io.io) as any,
                        this.getChartJSDataFor('swap', stats.data.io.swap) as any,
                      ],
                    }}
                  />
                </div>
                <div className={classes.bottomLegend}>
                  <div className={classes.red}>
                    I/O Rate
                  </div>
                  <div className={classes.yellow}>
                    Swap Rate
                  </div>
                </div>
              </div>
            </React.Fragment>
          }
        </ExpansionPanel>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(LinodeSummary);
