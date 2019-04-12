import * as moment from 'moment';
import { compose, map, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import FormControl from 'src/components/core/FormControl';
import InputLabel from 'src/components/core/InputLabel';
import MenuItem from 'src/components/core/MenuItem';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import LineGraph from 'src/components/LineGraph';
import Select from 'src/components/Select';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { displayType, typeLabelLong } from 'src/features/linodes/presentation';
import { getLinodeStats, getLinodeStatsByDate } from 'src/services/linodes';
import { ApplicationState } from 'src/store';
import { setUpCharts } from 'src/utilities/charts';
import { isRecent } from 'src/utilities/isRecent';
import {
  formatBitsPerSecond,
  formatBytes,
  formatNumber,
  formatPercentage,
  getMetrics,
  getTotalTraffic
} from 'src/utilities/statMetrics';
import ActivitySummary from './ActivitySummary';
import MetricsDisplay from './MetricsDisplay';
import StatsPanel from './StatsPanel';
import SummaryPanel from './SummaryPanel';
import TotalTraffic, { TotalTrafficProps } from './TotalTraffic';

setUpCharts();

type ClassNames =
  | 'main'
  | 'sidebar'
  | 'headerWrapper'
  | 'chart'
  | 'leftLegend'
  | 'bottomLegend'
  | 'graphTitle'
  | 'graphSelectTitle'
  | 'graphControls'
  | 'totalTraffic';

const styles: StyleRulesCallback<ClassNames> = theme => {
  return {
    main: {
      [theme.breakpoints.up('md')]: {
        order: 1
      }
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        order: 2
      }
    },
    headerWrapper: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit * 2
    },
    chart: {
      position: 'relative',
      width: 'calc(100vw - 80px)',
      paddingLeft: theme.spacing.unit * 4,
      [theme.breakpoints.up('md')]: {
        width: 'calc(80vw - 310px)'
      },
      [theme.breakpoints.up('xl')]: {
        width: 'calc(80vw - 370px)'
      }
    },
    leftLegend: {
      position: 'absolute',
      left: -8,
      bottom: '50%',
      transform: 'rotate(-90deg)',
      color: '#777',
      fontSize: 14
    },
    bottomLegend: {
      margin: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px ${
        theme.spacing.unit
      }px`,
      padding: 10,
      color: '#777',
      backgroundColor: theme.bg.offWhiteDT,
      border: `1px solid ${theme.color.border3}`,
      fontSize: 14,
      [theme.breakpoints.down('md')]: {
        '& > div': {
          marginBottom: theme.spacing.unit * 2
        }
      }
    },
    graphTitle: {
      marginRight: theme.spacing.unit * 2
    },
    graphSelectTitle: {
      marginRight: theme.spacing.unit,
      position: 'relative',
      color: theme.color.headline,
      top: -1
    },
    graphControls: {
      display: 'flex',
      alignItems: 'center',
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2
    },
    totalTraffic: {
      margin: '12px'
    }
  };
};

interface LinodeContextProps {
  linodeCreated: string;
  linodeId: number;
  linodeData: Linode.Linode;
}

interface State {
  stats: Linode.TodoAny;
  rangeSelection: string;
  statsLoadError?: string;
  dataIsLoading: boolean;
  isTooEarlyForGraphData?: boolean;
  statsError?: string;
}

type CombinedProps = LinodeContextProps &
  WithTypesProps &
  WithStyles<ClassNames>;

const chartHeight = 300;

const statsFetchInterval = 30000;

export class LinodeSummary extends React.Component<CombinedProps, State> {
  statsInterval?: number = undefined;
  mounted: boolean = false;

  state: State = {
    stats: undefined,
    rangeSelection: '24',
    dataIsLoading: false
  };

  rangeSelectOptions: (typeof MenuItem)[] = [];

  constructor(props: CombinedProps) {
    super(props);
    const { linodeCreated } = props;
    if (!linodeCreated) {
      return;
    }

    const options: [string, string][] = [['24', 'Last 24 Hours']];
    const [createMonth, createYear] = [
      // prepend "0" to the month if it's only 1 digit
      // otherwise, console complains the date isn't in
      // ISO or RFC2822 format
      (moment.utc(linodeCreated).month() + 1).toString().length === 1
        ? `0${moment.utc(linodeCreated).month() + 1}`
        : moment.utc(linodeCreated).month() + 1,
      moment.utc(linodeCreated).year()
    ];

    const currentMonth = moment.utc().month() + 1; // Add 1 here because JS months are 0-indexed
    const currentYear = moment.utc().year();

    const creationFirstOfMonth = moment(`${createYear}-${createMonth}-01`);
    let [testMonth, testYear] = [currentMonth, currentYear];
    let formattedTestDate;
    do {
      // When we request Linode stats for the CURRENT month/year, the data we get back is
      // from the last 30 days. We want the options to reflect this.
      //
      // Example: If it's Jan. 15, the options would be "Last 24 Hours", "Last 30 Days", "Dec 2018" ... etc.
      const optionDisplay =
        testYear === currentYear && testMonth === currentMonth
          ? 'Last 30 Days'
          : `${moment()
              .month(testMonth - 1)
              .format('MMM')} ${testYear}`;

      options.push([
        `${testYear} ${testMonth.toString().padStart(2, '0')}`,
        optionDisplay
      ]);

      if (testMonth === 1) {
        testMonth = 12;
        testYear -= 1;
      } else {
        testMonth -= 1;
      }
      // same comment as above. Month needs to be prepended with a "0"
      // if it's only one digit to appease moment.js
      formattedTestDate =
        testMonth.toString().length === 1
          ? `${testYear}-0${testMonth}-01`
          : `${testYear}-${testMonth}-01`;
    } while (moment(formattedTestDate).diff(creationFirstOfMonth) >= 0);
    (this.rangeSelectOptions as Linode.TodoAny) = options.map(option => {
      return (
        <MenuItem key={option[0]} value={option[0]}>
          {option[1]}
        </MenuItem>
      );
    });
  }

  componentDidMount() {
    this.mounted = true;
    // Only use loading state on initial data load. This will be set to false
    // in the getStats then and catch handlers.
    this.setState({ dataIsLoading: true }, this.getStats);
    this.statsInterval = window.setInterval(this.getStats, statsFetchInterval);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.statsInterval as number);
  }

  getStats = () => {
    const { linodeId } = this.props;
    const { rangeSelection } = this.state;
    if (!linodeId) {
      return;
    }
    this.setState({ statsError: undefined });
    let req;
    if (rangeSelection === '24') {
      req = getLinodeStats(linodeId);
    } else {
      const [year, month] = rangeSelection.split(' ');
      req = getLinodeStatsByDate(linodeId, year, month);
    }
    req
      .then(response => {
        if (!this.mounted) {
          return;
        }

        this.setState({ statsLoadError: undefined });
        this.setState({ stats: response.data, dataIsLoading: false });
      })
      .catch(errorResponse => {
        if (!this.mounted) {
          return;
        }

        const { linodeCreated } = this.props;

        // If a Linode has just been created, we'll get an error from the API when
        // requesting stats (since there's no data available yet.) In this case,
        // it'd be jarring to display the error state – we'd rather show a friendlier message.
        if (isRecent(linodeCreated, moment.utc().format())) {
          return this.setState({
            dataIsLoading: false,
            isTooEarlyForGraphData: true
          });
        }

        const errorText = pathOr(
          'There was an error retrieving information for this Linode.',
          ['reason'],
          errorResponse[0]
        );
        this.setState({ dataIsLoading: false, statsError: errorText });
      });
  };

  handleChartRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    this.setState({ rangeSelection: value }, () => {
      this.getStats();
    });
  };

  renderCPUChart = () => {
    const { rangeSelection, stats } = this.state;
    const { classes } = this.props;
    const data = pathOr([], ['data', 'cpu'], stats);

    const metrics = getMetrics(data);
    const format = formatPercentage;

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <div className={classes.leftLegend}>CPU %</div>
          <LineGraph
            chartHeight={chartHeight}
            showToday={rangeSelection === '24'}
            data={[
              {
                borderColor: '#428ade',
                data,
                label: 'CPU %'
              }
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <Grid container>
            <Grid item xs={12} lg={6}>
              <MetricsDisplay
                rows={[
                  {
                    legendTitle: 'CPU %',
                    legendColor: 'blue',
                    data: metrics,
                    format
                  }
                ]}
              />
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  };

  renderIPv4TrafficChart = () => {
    const { classes } = this.props;
    const { rangeSelection, stats } = this.state;

    const v4Data = {
      publicIn: pathOr([], ['data', 'netv4', 'in'], stats),
      publicOut: pathOr([], ['data', 'netv4', 'out'], stats),
      privateIn: pathOr([], ['data', 'netv4', 'private_in'], stats),
      privateOut: pathOr([], ['data', 'netv4', 'private_out'], stats)
    };

    // Need these to calculate Total Traffic
    const v6Data = {
      publicIn: pathOr([], ['data', 'netv6', 'in'], stats),
      publicOut: pathOr([], ['data', 'netv6', 'out'], stats),
      privateIn: pathOr([], ['data', 'netv6', 'private_in'], stats)
    };

    const format = formatBitsPerSecond;

    // @todo refactor this component so that these calcs don't need to be done
    // again when we render the v6 chart
    const netv6InMetrics = getMetrics(v6Data.publicIn);
    const netv6OutMetrics = getMetrics(v6Data.publicOut);

    const netv4InMetrics = getMetrics(v4Data.publicIn);
    const netv4OutMetrics = getMetrics(v4Data.publicOut);

    const totalTraffic: TotalTrafficProps = map(
      formatBytes,
      getTotalTraffic(
        netv4InMetrics.total,
        netv4OutMetrics.total,
        v4Data.publicIn.length,
        netv6InMetrics.total,
        netv6OutMetrics.total
      )
    );

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <div className={classes.leftLegend}>bits/sec</div>
          <LineGraph
            chartHeight={chartHeight}
            showToday={rangeSelection === '24'}
            data={[
              {
                borderColor: '#3683dc',
                data: v4Data.publicIn,
                label: 'Public Traffic In'
              },
              {
                borderColor: '#01b159',
                data: v4Data.publicOut,
                label: 'Public Traffic Out'
              },
              {
                borderColor: '#d01e1e',
                data: v4Data.privateIn,
                label: 'Private Traffic In'
              },
              {
                borderColor: '#ffd100',
                data: v4Data.privateOut,
                label: 'Private Traffic Out'
              }
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <Grid container>
            <Grid item xs={12} lg={6}>
              <MetricsDisplay
                rows={[
                  {
                    legendTitle: 'Private Outbound',
                    legendColor: 'yellow',
                    data: getMetrics(v4Data.privateOut),
                    format
                  },
                  {
                    legendTitle: 'Private Inbound',
                    legendColor: 'red',
                    data: getMetrics(v4Data.privateIn),
                    format
                  }
                ]}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <MetricsDisplay
                rows={[
                  {
                    legendTitle: 'Public Outbound',
                    legendColor: 'green',
                    data: netv4OutMetrics,
                    format
                  },
                  {
                    legendTitle: 'Public Inbound',
                    legendColor: 'blue',
                    data: netv4InMetrics,
                    format
                  }
                ]}
              />
            </Grid>
          </Grid>
        </div>
        {rangeSelection === '24' && (
          <Grid item xs={12} lg={6} className={classes.totalTraffic}>
            <TotalTraffic
              inTraffic={totalTraffic.inTraffic}
              outTraffic={totalTraffic.outTraffic}
              combinedTraffic={totalTraffic.combinedTraffic}
            />
          </Grid>
        )}
      </React.Fragment>
    );
  };

  renderIPv6TrafficChart = () => {
    const { classes } = this.props;
    const { rangeSelection, stats } = this.state;

    const data = {
      publicIn: pathOr([], ['data', 'netv6', 'in'], stats),
      publicOut: pathOr([], ['data', 'netv6', 'out'], stats),
      privateIn: pathOr([], ['data', 'netv6', 'private_in'], stats),
      privateOut: pathOr([], ['data', 'netv6', 'private_out'], stats)
    };

    const format = formatBitsPerSecond;

    const publicInMetrics = getMetrics(data.publicIn);
    const publicOutMetrics = getMetrics(data.publicOut);

    const totalTraffic: TotalTrafficProps = map(
      formatBytes,
      getTotalTraffic(
        publicInMetrics.total,
        publicOutMetrics.total,
        publicInMetrics.length
      )
    );

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <div className={classes.leftLegend}>bits/sec</div>
          <LineGraph
            chartHeight={chartHeight}
            showToday={rangeSelection === '24'}
            data={[
              {
                borderColor: '#3683dc',
                data: data.publicIn,
                label: 'Public Traffic In'
              },
              {
                borderColor: '#01b159',
                data: data.publicOut,
                label: 'Public Traffic Out'
              },
              {
                borderColor: '#d01e1e',
                data: data.privateIn,
                label: 'Private Traffic In'
              },
              {
                borderColor: '#ffd100',
                data: data.privateOut,
                label: 'Private Traffic Out'
              }
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <Grid container>
            <Grid item xs={12} lg={6}>
              <MetricsDisplay
                rows={[
                  {
                    legendTitle: 'Private Outbound',
                    legendColor: 'yellow',
                    data: getMetrics(data.privateOut),
                    format
                  },
                  {
                    legendTitle: 'Private Inbound',
                    legendColor: 'red',
                    data: getMetrics(data.privateIn),
                    format
                  }
                ]}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <MetricsDisplay
                rows={[
                  {
                    legendTitle: 'Public Outbound',
                    legendColor: 'green',
                    data: publicOutMetrics,
                    format
                  },
                  {
                    legendTitle: 'Public Inbound',
                    legendColor: 'blue',
                    data: publicInMetrics,
                    format
                  }
                ]}
              />
            </Grid>
          </Grid>
        </div>
        {rangeSelection === '24' && (
          <Grid item xs={12} lg={6} className={classes.totalTraffic}>
            <TotalTraffic
              inTraffic={totalTraffic.inTraffic}
              outTraffic={totalTraffic.outTraffic}
              combinedTraffic={totalTraffic.combinedTraffic}
            />
          </Grid>
        )}
      </React.Fragment>
    );
  };

  renderDiskIOChart = () => {
    const { classes } = this.props;
    const { rangeSelection, stats } = this.state;

    const data = {
      io: pathOr([], ['data', 'io', 'io'], stats),
      swap: pathOr([], ['data', 'io', 'swap'], stats)
    };

    const format = formatNumber;

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <div className={classes.leftLegend} style={{ left: -18, bottom: 48 }}>
            blocks/sec
          </div>
          <LineGraph
            chartHeight={chartHeight}
            showToday={rangeSelection === '24'}
            data={[
              {
                borderColor: '#ffd100',
                data: data.io,
                label: 'Disk I/O'
              },
              {
                borderColor: '#d01e1e',
                data: data.swap,
                label: 'Swap I/O'
              }
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <Grid container>
            <Grid item xs={12} lg={6}>
              <MetricsDisplay
                rows={[
                  {
                    legendTitle: 'I/O Rate',
                    legendColor: 'yellow',
                    data: getMetrics(data.io),
                    format
                  }
                ]}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <MetricsDisplay
                rows={[
                  {
                    legendTitle: 'Swap Rate',
                    legendColor: 'red',
                    data: getMetrics(data.swap),
                    format
                  }
                ]}
              />
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { linodeData: linode, classes, typesData } = this.props;

    const {
      dataIsLoading,
      statsError,
      rangeSelection,
      isTooEarlyForGraphData
    } = this.state;

    // Shared props for all stats charts
    const chartProps = {
      loading: dataIsLoading,
      error: statsError,
      height: chartHeight,
      isTooEarlyForGraphData
    };

    if (!linode) {
      return null;
    }

    const longLabel = typeLabelLong(
      displayType(linode.type, typesData || []),
      linode.specs.memory,
      linode.specs.disk,
      linode.specs.vcpus
    );

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linode.label} - Summary`} />

        <Grid container>
          <Grid item xs={12} md={3} className={classes.sidebar}>
            <SummaryPanel />
          </Grid>
          <Grid item xs={12} md={9} className={classes.main}>
            <Grid
              container
              justify="space-between"
              alignItems="center"
              className={classes.headerWrapper}
            >
              <Grid item className="py0">
                <Typography variant="h2" className={classes.graphTitle}>
                  {longLabel}
                </Typography>
              </Grid>
            </Grid>

            <Grid item>
              <ActivitySummary linodeId={linode.id} />
            </Grid>

            <Grid item className="py0">
              <div className={classes.graphControls}>
                <FormControl>
                  <InputLabel htmlFor="chartRange" disableAnimation hidden>
                    Select Time Range
                  </InputLabel>
                  <Select
                    value={rangeSelection}
                    onChange={this.handleChartRangeChange}
                    inputProps={{ name: 'chartRange', id: 'chartRange' }}
                    small
                  >
                    {this.rangeSelectOptions}
                  </Select>
                </FormControl>
              </div>
            </Grid>

            <StatsPanel
              title="CPU Usage"
              renderBody={this.renderCPUChart}
              {...chartProps}
            />

            <StatsPanel
              title="IPv4 Traffic"
              renderBody={this.renderIPv4TrafficChart}
              {...chartProps}
            />

            <StatsPanel
              title="IPv6 Traffic"
              renderBody={this.renderIPv6TrafficChart}
              {...chartProps}
            />

            <StatsPanel
              title="Disk IO"
              renderBody={this.renderDiskIOChart}
              {...chartProps}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeCreated: linode.created,
  linodeId: linode.id,
  linodeData: linode
}));

interface WithTypesProps {
  typesData: Linode.LinodeType[];
}

const withTypes = connect((state: ApplicationState, ownProps) => ({
  typesData: state.__resources.types.entities
}));

const enhanced = compose(
  styled,
  withTypes,
  linodeContext
);

export default enhanced(LinodeSummary);
