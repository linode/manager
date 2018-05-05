import * as React from 'react';
import * as moment from 'moment';
import * as Raven from 'raven-js';
import { Line } from 'react-chartjs-2';
import { pathOr, clone } from 'ramda';

import { withStyles, StyleRulesCallback, WithStyles, Typography } from 'material-ui';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import { MenuItem } from 'material-ui/Menu';

import { sendToast } from 'src/features/ToastNotifications/toasts';
import { setUpCharts } from 'src/utilities/charts';
import transitionStatus from 'src/features/linodes/linodeTransitionStatus';
import ExpansionPanel from 'src/components/ExpansionPanel';

import Select from 'src/components/Select';

import LinodeBusyStatus from './LinodeBusyStatus';
import SummaryPanel from './SummaryPanel';
import { getLinodeStats } from 'src/services/linodes';

setUpCharts();

type ClassNames = 'chart'
  | 'leftLegend'
  | 'bottomLegend'
  | 'graphTitle'
  | 'graphControls'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  return {
    chart: {
      position: 'relative',
      width: 'calc(100vw - 80px)',
      paddingLeft: theme.spacing.unit * 4,
      [theme.breakpoints.up('md')]: {
        width: 'calc(100vw - 310px)',
      },
      [theme.breakpoints.up('xl')]: {
        width: 'calc(100vw - 370px)',
      },
    },
    leftLegend: {
      position: 'absolute',
      left: -8,
      bottom: 36,
      transform: 'rotate(-90deg)',
      color: '#777',
      fontSize: 14,
    },
    bottomLegend: {
      margin: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px ${theme.spacing.unit}px`,
      display: 'flex',
      flexWrap: 'wrap',
      color: '#777',
      fontSize: 14,
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        '& > div': {
          marginBottom: theme.spacing.unit * 2,
        },
      },
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
    graphTitle: {
      position: 'relative',
      top: 6,
      marginRight: theme.spacing.unit * 2,
    },
    graphControls: {
      marginTop: theme.spacing.unit * 2,
      display: 'flex',
      alignItems: 'center',
    },
    blue: {
      '&:before': {
        backgroundColor: theme.palette.primary.main,
      },
    },
    green: {
      '&:before': {
        backgroundColor: theme.color.green,
      },
    },
    red: {
      '&:before': {
        backgroundColor: theme.color.red,
      },
    },
    yellow: {
      '&:before': {
        backgroundColor: theme.color.yellow,
      },
    },
  };
};

interface Props {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes: Linode.Volume[];
}

interface State {
  stats: Linode.TodoAny;
  rangeSelection: string;
  statsLoadError?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const chartOptions: any = {
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
        beginAtZero: true,
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
  tooltips: {
    cornerRadius: 0,
    backgroundColor: '#fbfbfb',
    bodyFontColor: '#333',
    displayColors: false,
    titleFontColor: '#666',
    xPadding: 16,
    yPadding: 10,
    borderWidth: .5,
    borderColor: '#999',
    caretPadding: 10,
    position: 'nearest',
  },
};

const chartHeight = 300;

const statsFetchInterval = 30000;

const lineOptions = {
  backgroundColor: 'rgba(0, 0, 0, 0)',
  borderWidth: 1,
  borderJoinStyle: 'miter',
  lineTension: 0,
  pointRadius: 0,
  pointHitRadius: 10,
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
  statsInterval?: number = undefined;
  mounted: boolean = false;

  state: State = {
    stats: undefined,
    rangeSelection: '24',
  };

  rangeSelectOptions: (typeof MenuItem)[] = [];

  constructor(props: CombinedProps) {
    super(props);
    const { linode } = props;

    const options: [string, string][] = [['24', 'Last 24 Hours']];
    const [createMonth, createYear] = [
      moment.utc(linode.created).month() + 1,
      moment.utc(linode.created).year(),
    ];
    const creationFirstOfMonth = moment(`${createYear}-${createMonth}-01`);
    let [testMonth, testYear] = [moment.utc().month() + 1, moment.utc().year()];
    do {
      options.push([
        `${testYear} ${testMonth.toString().padStart(2, '0')}`,
        `${moment().month(testMonth - 1).format('MMM')} ${testYear}`,
      ]);

      if (testMonth === 1) {
        testMonth = 12;
        testYear -= 1;
      } else {
        testMonth -= 1;
      }
    } while (moment(`${testYear}-${testMonth}-01`).diff(creationFirstOfMonth) >= 0);
    (this.rangeSelectOptions as Linode.TodoAny) = options.map((option) => {
      return <MenuItem key={option[0]} value={option[0]}>{option[1]}</MenuItem>;
    });

  }

  getStats() {
    const { linode } = this.props;
    const { rangeSelection } = this.state;
    let req;
    if (rangeSelection === '24') {
      req = getLinodeStats(linode.id);
    } else {
      const [year, month] = rangeSelection.split(' ');
      req = getLinodeStats(linode.id, year, month);
    }
    req
      .then((response) => {
        if (!this.mounted) { return; }

        this.setState({ statsLoadError: undefined });
        this.setState({ stats: response.data });
      })
      .catch((errorResponse) => {
        if (!this.mounted) { return; }

        if (pathOr(undefined, ['response', 'status'], errorResponse) === 429) {
          sendToast('Rate limit exceeded when fetching performance statistics', 'error');
          this.setState({ statsLoadError: 'rateLimited' });
        } else {
          pathOr(
            [{ reason: 'Network Error when fetching performance statistics' }],
            ['response', 'data', 'errors'], errorResponse)
            .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
          this.setState({ statsLoadError: 'error' });
        }

        Raven.captureException(errorResponse);
      });
  }

  componentDidMount() {
    this.mounted = true;
    this.getStats();
    this.statsInterval = window.setInterval(() => this.getStats(), statsFetchInterval);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.statsInterval as number);
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

  getChartOptions(stat: string) {
    const finalChartOptions = clone(chartOptions);
    const { rangeSelection } = this.state;

    if (rangeSelection === '24') {
      finalChartOptions.scales.xAxes[0].time.displayFormats = {
        hour: 'HH:00',
        minute: 'HH:00',
      };
    } else {
      finalChartOptions.scales.xAxes[0].time.displayFormats = {
        hour: 'MMM DD',
        minute: 'MMM DD',
      };
    }

    if (stat === 'cpu') {
      finalChartOptions.scales.yAxes[0].ticks.suggestedMax = 100;
    }

    return finalChartOptions;
  }

  handleChartRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({ rangeSelection: value }, () => {
      this.getStats();
    });
  }

  render() {
    const { linode, type, image, volumes, classes } = this.props;
    const { stats, rangeSelection } = this.state;
    return (
      <React.Fragment>
        {transitionStatus.includes(linode.status) &&
          <LinodeBusyStatus linode={linode} />
        }
        <SummaryPanel linode={linode} type={type} image={image} volumes={volumes} />

        {stats &&
          <React.Fragment>
            <div className={classes.graphControls}>
              <Typography variant="title" className={classes.graphTitle}>
                Graphs
              </Typography>
              <FormControl style={{ martginTop: 0 }}>
                <InputLabel htmlFor="chartRange" disableAnimation hidden>
                  Select Time Range
                </InputLabel>
                <Select
                  value={rangeSelection}
                  onChange={this.handleChartRangeChange}
                  inputProps={{ name: 'chartRange', id: 'chartRange' }}
                >
                  {this.rangeSelectOptions}
                </Select>
              </FormControl>
            </div>

            <ExpansionPanel
              heading={statToLabel.cpu}
              defaultExpanded
            >
              <React.Fragment>
                <div className={classes.chart}>
                  <div className={classes.leftLegend}>
                    CPU %
                  </div>
                  <Line
                    height={chartHeight}
                    options={this.getChartOptions('cpu')}
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
              </React.Fragment>
            </ExpansionPanel>

            <ExpansionPanel
              heading="IPv4 Traffic"
              defaultExpanded
            >
              <React.Fragment>
                <div className={classes.chart}>
                  <div className={classes.leftLegend}>
                    bits/sec
                  </div>
                  <Line
                    height={chartHeight}
                    options={this.getChartOptions('ipv4')}
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
              </React.Fragment>
            </ExpansionPanel>

            <ExpansionPanel
              heading="IPv6 Traffic"
              defaultExpanded
            >
              <React.Fragment>
                <div className={classes.chart}>
                  <div className={classes.leftLegend}>
                    bits/sec
                  </div>
                  <Line
                    height={chartHeight}
                    options={this.getChartOptions('ipv6')}
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
              </React.Fragment>
            </ExpansionPanel>

            <ExpansionPanel
              heading="Disk I/O"
              defaultExpanded
            >
              <React.Fragment>
                <div className={classes.chart}>
                  <div className={classes.leftLegend}>
                    blocks/sec
                    </div>
                  <Line
                    height={chartHeight}
                    options={this.getChartOptions('disk')}
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
              </React.Fragment>
            </ExpansionPanel>
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(LinodeSummary);
