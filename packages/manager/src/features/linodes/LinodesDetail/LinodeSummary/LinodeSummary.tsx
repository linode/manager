import {
  getLinodeStats,
  getLinodeStatsByDate,
  Linode,
  LinodeType,
  Stats,
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes';
import { DateTime } from 'luxon';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme,
  withTheme,
} from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import LineGraph from 'src/components/LineGraph';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { ApplicationState } from 'src/store';
import { ExtendedEvent } from 'src/store/events/event.types';
import { setUpCharts } from 'src/utilities/charts';
import { parseAPIDate } from 'src/utilities/date';
import getUserTimezone from 'src/utilities/getUserTimezone';
import { initAll } from 'src/utilities/initAll';
import { isRecent } from 'src/utilities/isRecent';
import {
  formatNumber,
  formatPercentage,
  getMetrics,
} from 'src/utilities/statMetrics';
import NetworkGraph from './NetworkGraph';
import StatsPanel from './StatsPanel';
import { ChartProps } from './types';
setUpCharts();

type ClassNames =
  | 'root'
  | 'chartSelect'
  | 'graphControls'
  | 'graphGrids'
  | 'grid'
  | 'labelRangeSelect';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    chartSelect: {
      maxWidth: 150,
    },
    graphControls: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: theme.spacing(),
    },
    graphGrids: {
      flexWrap: 'nowrap',
      margin: 0,
      [theme.breakpoints.down(1100)]: {
        flexWrap: 'wrap',
      },
    },
    grid: {
      backgroundColor: theme.bg.offWhiteDT,
      border: `solid 1px ${theme.cmrBorderColors.divider}`,
      marginBottom: theme.spacing(2),
      '&.MuiGrid-item': {
        padding: theme.spacing(2),
      },
      '& h2': {
        fontSize: '1rem',
      },
      [theme.breakpoints.up(1100)]: {
        '&:first-of-type': {
          marginRight: theme.spacing(2),
        },
      },
    },
    labelRangeSelect: {
      fontSize: '1rem',
      paddingRight: theme.spacing(2),
    },
  });

interface LinodeContextProps {
  linodeCreated: string;
  linodeId: number;
  linodeData: Linode;
  linodeVolumes: Volume[];
  linodeVolumesError?: APIError[];
}

interface State {
  stats?: Stats;
  rangeSelection: string;
  statsLoadError?: string;
  dataIsLoading: boolean;
  isTooEarlyForGraphData?: boolean;
  statsError?: string;
}

interface Props {
  isBareMetalInstance: boolean;
}

type CombinedProps = Props &
  LinodeContextProps &
  WithTheme &
  WithTypesProps &
  WithImages &
  WithStyles<ClassNames>;

const chartHeight = 160;

const statsFetchInterval = 30000;

export class LinodeSummary extends React.Component<CombinedProps, State> {
  statsInterval?: number = undefined;
  mounted: boolean = false;

  state: State = {
    stats: undefined,
    rangeSelection: '24',
    dataIsLoading: false,
  };

  rangeSelectOptions: Item[] = [];

  constructor(props: CombinedProps) {
    super(props);
    const { linodeCreated } = props;
    if (!linodeCreated) {
      return;
    }

    const options: [string, string][] = [['24', 'Last 24 Hours']];
    const createdDate = parseAPIDate(linodeCreated);
    const currentTime = DateTime.local();
    const currentMonth = currentTime.month;
    const currentYear = currentTime.year;

    const creationFirstOfMonth = createdDate.startOf('month');
    let [testMonth, testYear] = [currentMonth, currentYear];
    let testDate;
    do {
      // When we request Linode stats for the CURRENT month/year, the data we get back is
      // from the last 30 days. We want the options to reflect this.
      //
      // Example: If it's Jan. 15, the options would be "Last 24 Hours", "Last 30 Days", "Dec 2018" ... etc.
      const optionDisplay =
        testYear === currentYear && testMonth === currentMonth
          ? 'Last 30 Days'
          : currentTime
              .set({ month: testMonth, year: testYear })
              .toFormat('LLL yyyy');
      options.push([
        `${testYear} ${testMonth.toString().padStart(2, '0')}`,
        optionDisplay,
      ]);

      if (testMonth === 1) {
        testMonth = 12;
        testYear -= 1;
      } else {
        testMonth -= 1;
      }
      // same comment as above. Month needs to be prepended with a "0"
      // if it's only one digit to appease moment.js
      testDate = DateTime.fromObject({
        month: testMonth,
        year: testYear,
        day: 1,
      });
    } while (testDate >= creationFirstOfMonth);
    this.rangeSelectOptions = options.map((option) => {
      return { label: option[1], value: option[0] };
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
    const { linodeId, linodeCreated } = this.props;

    // Stats will not be available for a Linode for at least 5 minutes after
    // it's been created, so no need to do an expensive `/stats` request until
    // 5 minutes have passed.
    const fiveMinutesAgo = DateTime.local().minus({ minutes: 5 });
    if (parseAPIDate(linodeCreated) > fiveMinutesAgo) {
      return this.setState({
        dataIsLoading: false,
        isTooEarlyForGraphData: true,
      });
    }

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
      .then((response) => {
        if (!this.mounted) {
          return;
        }

        this.setState({ statsLoadError: undefined });
        this.setState({
          // Occasionally the last reading of each stats reading is incorrect, so we drop
          // the last element of each array in the stats response.
          stats: initAll(response),
          dataIsLoading: false,
        });
      })
      .catch((errorResponse) => {
        if (!this.mounted) {
          return;
        }

        // If a Linode has just been created, we'll get an error from the API when
        // requesting stats (since there's no data available yet.) In this case,
        // it'd be jarring to display the error state – we'd rather show a friendlier message.
        if (isRecent(linodeCreated, DateTime.local().toISO())) {
          return this.setState({
            dataIsLoading: false,
            isTooEarlyForGraphData: true,
          });
        }

        const errorText = pathOr(
          'There was an error retrieving information for this Linode.',
          ['reason'],
          errorResponse[0]
        );

        /** only show an error if stats aren't already loaded */
        return !this.state.stats
          ? this.setState({ dataIsLoading: false, statsError: errorText })
          : this.setState({ dataIsLoading: false });
      });
  };

  handleChartRangeChange = (e: Item<string>) => {
    const value = e.value;
    this.setState({ rangeSelection: value }, () => {
      this.getStats();
    });
  };

  renderCPUChart = () => {
    const { rangeSelection, stats } = this.state;
    const { timezone, theme } = this.props;

    const data = pathOr([], ['data', 'cpu'], stats);

    const metrics = getMetrics(data);
    const format = formatPercentage;

    return (
      <LineGraph
        timezone={timezone}
        chartHeight={chartHeight}
        showToday={rangeSelection === '24'}
        data={[
          {
            borderColor: 'transparent',
            backgroundColor: theme.graphs.cpu.percent,
            data,
            label: 'CPU %',
          },
        ]}
        legendRows={[
          {
            legendTitle: 'CPU %',
            legendColor: 'blue',
            data: metrics,
            format,
          },
        ]}
      />
    );
  };

  renderDiskIOChart = () => {
    const { timezone, theme } = this.props;
    const { rangeSelection, stats } = this.state;

    const data = {
      io: pathOr([], ['data', 'io', 'io'], stats),
      swap: pathOr([], ['data', 'io', 'swap'], stats),
    };

    const format = formatNumber;

    return (
      <LineGraph
        timezone={timezone}
        chartHeight={chartHeight}
        showToday={rangeSelection === '24'}
        data={[
          {
            borderColor: 'transparent',
            backgroundColor: theme.graphs.diskIO.read,
            data: data.io,
            label: 'I/O Rate',
          },
          {
            borderColor: 'transparent',
            backgroundColor: theme.graphs.diskIO.swap,
            data: data.swap,
            label: 'Swap Rate',
          },
        ]}
        legendRows={[
          {
            data: getMetrics(data.io),
            format,
          },
          {
            data: getMetrics(data.swap),
            format,
          },
        ]}
      />
    );
  };

  render() {
    const { linodeData: linode, isBareMetalInstance, classes } = this.props;

    const { dataIsLoading, statsError, isTooEarlyForGraphData } = this.state;

    // Shared props for all stats charts
    const chartProps: ChartProps = {
      loading: dataIsLoading,
      error: statsError,
      height: chartHeight,
      isTooEarlyForGraphData: Boolean(isTooEarlyForGraphData),
      timezone: this.props.timezone,
      rangeSelection: this.state.rangeSelection,
    };

    if (!linode) {
      return null;
    }

    return (
      <Paper>
        <Grid container className={`${classes.root} m0`}>
          <Grid item className={`${classes.graphControls} p0`} xs={12}>
            <Select
              options={this.rangeSelectOptions}
              defaultValue={this.rangeSelectOptions[0]}
              onChange={this.handleChartRangeChange}
              name="chartRange"
              id="chartRange"
              small
              label="Select Time Range"
              hideLabel
              className={classes.chartSelect}
              isClearable={false}
              data-qa-item="chartRange"
            />
          </Grid>
          {!isBareMetalInstance ? (
            <Grid container item xs={12} className={`${classes.graphGrids} p0`}>
              <Grid item className={classes.grid} xs={12}>
                <StatsPanel
                  title="CPU (%)"
                  renderBody={this.renderCPUChart}
                  {...chartProps}
                />
              </Grid>
              <Grid item className={classes.grid} xs={12}>
                <StatsPanel
                  title="Disk IO (blocks/s)"
                  renderBody={this.renderDiskIOChart}
                  {...chartProps}
                />
              </Grid>
            </Grid>
          ) : null}

          <NetworkGraph stats={this.state.stats} {...chartProps} />
        </Grid>
      </Paper>
    );
  }
}

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeCreated: linode.created,
  linodeId: linode.id,
  linodeData: linode,
  linodeVolumes: linode._volumes,
  linodeVolumesError: linode._volumesError,
}));

interface WithTypesProps {
  typesData: LinodeType[];
  timezone: string;
  inProgressEvents: Record<number, number>;
  events: ExtendedEvent[];
  mostRecentEventTime: string;
}

const withTypes = connect((state: ApplicationState, _ownProps) => ({
  typesData: state.__resources.types.entities,
  timezone: getUserTimezone(state),
  inProgressEvents: state.events.inProgressEvents,
  events: state.events.events,
  mostRecentEventTime: state.events.mostRecentEventTime,
}));

const enhanced = compose<CombinedProps, Props>(
  withTypes,
  linodeContext,
  withImages(),
  withTheme,
  styled
);

export default enhanced(LinodeSummary);
