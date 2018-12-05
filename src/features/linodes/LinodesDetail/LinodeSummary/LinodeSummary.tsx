import * as moment from 'moment';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import FormControl from 'src/components/core/FormControl';
import InputLabel from 'src/components/core/InputLabel';
import MenuItem from 'src/components/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LineGraph from 'src/components/LineGraph';
import Select from 'src/components/Select';
import { withTypes } from 'src/context/types';
import { withImage, withLinode } from 'src/features/linodes/LinodesDetail/context';
import { displayType, typeLabelLong } from 'src/features/linodes/presentation';
import { getLinodeStats, getLinodeStatsByDate } from 'src/services/linodes';
import { setUpCharts } from 'src/utilities/charts';
import { getMetrics, withBitrate, withPercentSign } from 'src/utilities/statMetrics';
import CPUMetrics from './CPUMetrics';
import DiskIOMetrics from './DiskIOMetrics';
import IPMetrics from './IPMetrics';
import StatsPanel from './StatsPanel';
import SummaryPanel from './SummaryPanel';

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

const styles: StyleRulesCallback<ClassNames> = (theme) => {
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
      bottom: 39,
      transform: 'rotate(-90deg)',
      color: '#777',
      fontSize: 14,
    },
    bottomLegend: {
      margin: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px ${theme.spacing.unit}px`,
      // display: 'flex',
      // flexWrap: 'wrap',
      color: '#777',
      fontSize: 14,
      [theme.breakpoints.down('md')]: {
        // flexDirection: 'column',
        '& > div': {
          marginBottom: theme.spacing.unit * 2,
        },
      },
      // '& > div': {
      //   display: 'flex',
      //   marginRight: theme.spacing.unit * 5,
      //   '&:before': {
      //     content: '""',
      //     display: 'block',
      //     width: 20,
      //     height: 20,
      //     marginRight: theme.spacing.unit,
      //   },
      // },
    },
    graphTitle: {
      marginRight: theme.spacing.unit * 2,
    },
    graphControls: {
      margin: `${theme.spacing.unit * 2}px 0`,
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

interface TypesContextProps {
  typesData?: Linode.LinodeType[];
}

interface LinodeContextProps {
  linodeCreated: string;
  linodeId: number;
  linodeData: Linode.Linode;
  imageData: Linode.Image;
  volumesData: Linode.Volume[];
}

interface State {
  stats: Linode.TodoAny;
  rangeSelection: string;
  statsLoadError?: string;
  dataIsLoading: boolean;
  statsError?: string;
}

type CombinedProps = LinodeContextProps &
  TypesContextProps &
  WithStyles<ClassNames>;

const chartHeight = 300;

const statsFetchInterval = 30000;

export class LinodeSummary extends React.Component<CombinedProps, State> {
  statsInterval?: number = undefined;
  mounted: boolean = false;

  state: State = {
    stats: undefined,
    rangeSelection: '24',
    dataIsLoading: false,
  };

  rangeSelectOptions: (typeof MenuItem)[] = [];

  constructor(props: CombinedProps) {
    super(props);
    const { linodeCreated } = props;
    if(!linodeCreated) { return };

    const options: [string, string][] = [['24', 'Last 24 Hours']];
    const [createMonth, createYear] = [
      // prepend "0" to the month if it's only 1 digit
      // otherwise, console complains the date isn't in
      // ISO or RFC2822 format
      (moment.utc(linodeCreated).month() + 1).toString().length === 1
        ? `0${moment.utc(linodeCreated).month() + 1}`
        : moment.utc(linodeCreated).month() + 1,
      moment.utc(linodeCreated).year(),
    ];
    const creationFirstOfMonth = moment(`${createYear}-${createMonth}-01`);
    let [testMonth, testYear] = [
      moment.utc().month() + 1,
      moment.utc().year()
    ];
    let formattedTestDate;
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
      // same comment as above. Month needs to be prepended with a "0"
      // if it's only one digit to appease moment.js
      formattedTestDate = (testMonth.toString().length === 1)
        ? `${testYear}-0${testMonth}-01`
        : `${testYear}-${testMonth}-01`;
    } while (moment(formattedTestDate).diff(creationFirstOfMonth) >= 0);
    (this.rangeSelectOptions as Linode.TodoAny) = options.map((option) => {
      return <MenuItem key={option[0]} value={option[0]}>{option[1]}</MenuItem>;
    });

  }

  componentDidMount() {
    this.mounted = true;
    // Only use loading state on initial data load. This will be set to false
    // in the getStats then and catch handlers.
    this.setState({ dataIsLoading: true, }, this.getStats);
    this.statsInterval = window.setInterval(this.getStats, statsFetchInterval);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.statsInterval as number);
  }

  getStats = () => {
    const { linodeId } = this.props;
    const { rangeSelection } = this.state;
    if (!linodeId) { return; }
    this.setState({ statsError: undefined, });
    let req;
    if (rangeSelection === '24') {
      req = getLinodeStats(linodeId);
    } else {
      const [year, month] = rangeSelection.split(' ');
      req = getLinodeStatsByDate(linodeId, year, month);
    }
    req
      .then((response) => {
        if (!this.mounted) { return; }

        this.setState({ statsLoadError: undefined });
        this.setState({ stats: response.data, dataIsLoading: false });
      })
      .catch((errorResponse) => {
        if (!this.mounted) { return; }
        const errorText = pathOr("There was an error retrieving information for this Linode.",
          ['reason'], errorResponse[0]);
        this.setState({ dataIsLoading: false, statsError: errorText, })
      });
  }

  handleChartRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    this.setState({ rangeSelection: value }, () => {
      this.getStats();
    });
  }

  renderCPUChart = () => {
    const { rangeSelection, stats } = this.state;
    const { classes } = this.props;
    const data = pathOr([[]], ['data','cpu'], stats);

    const metrics = getMetrics(data);

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <div className={classes.leftLegend}>
            CPU %
          </div>
          <LineGraph
            chartHeight={chartHeight}
            showToday={rangeSelection === '24'}
            data={[
              {
                borderColor: '#428ade',
                data,
                label: 'CPU %',
              },
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <CPUMetrics metrics={withPercentSign(metrics)} />
        </div>
      </React.Fragment>
    )
  }

  renderIPv4TrafficChart = () => {
    const { classes } = this.props;
    const { rangeSelection, stats } = this.state;

    const data = {
      publicIn: pathOr([[]], ['data','netv4','in'], stats),
      publicOut: pathOr([[]], ['data','netv4','out'], stats),
      privateIn: pathOr([[]], ['data','netv4','private_in'], stats),
      privateOut: pathOr([[]], ['data','netv4','private_out'], stats)
    };

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <div className={classes.leftLegend}>
            bits/sec
          </div>
          <LineGraph
            chartHeight={chartHeight}
            showToday={rangeSelection === '24'}
            data={[
              {
                borderColor: '#3683dc',
                data: data.publicIn,
                label: 'Public Traffic In',
              },
              {
                borderColor: '#01b159',
                data: data.publicOut,
                label: 'Public Traffic Out',
              },
              {
                borderColor: '#d01e1e',
                data: data.privateIn,
                label: 'Private Traffic In',
              },
              {
                borderColor: '#ffd100',
                data: data.privateOut,
                label: 'Private Traffic Out',
              },
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <IPMetrics
            privateIn={withBitrate(getMetrics(data.privateIn))}
            privateOut={withBitrate(getMetrics(data.privateOut))}
            publicIn={withBitrate(getMetrics(data.publicIn))}
            publicOut={withBitrate(getMetrics(data.publicOut))}
          />
        </div>
      </React.Fragment>
    )
  }

  renderIPv6TrafficChart = () => {
    const { classes } = this.props;
    const { rangeSelection, stats } = this.state;

    const data = {
      publicIn: pathOr([[]], ['data','netv6','in'], stats),
      publicOut: pathOr([[]], ['data','netv6','out'], stats),
      privateIn: pathOr([[]], ['data','netv6','private_in'], stats),
      privateOut: pathOr([[]], ['data','netv6','private_out'], stats)
    };

    return (
      <React.Fragment>
        <div className={classes.chart}>
          <div className={classes.leftLegend}>
            bits/sec
          </div>
          <LineGraph
            chartHeight={chartHeight}
            showToday={rangeSelection === '24'}
            data={[
              {
                borderColor: '#3683dc',
                data: data.publicIn,
                label: 'Public Traffic In',
              },
              {
                borderColor: '#01b159',
                data: data.publicOut,
                label: 'Public Traffic Out',
              },
              {
                borderColor: '#d01e1e',
                data: data.privateIn,
                label: 'Private Traffic In',
              },
              {
                borderColor: '#ffd100',
                data: data.privateOut,
                label: 'Private Traffic Out',
              },
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <IPMetrics
            privateIn={withBitrate(getMetrics(data.privateIn))}
            privateOut={withBitrate(getMetrics(data.privateOut))}
            publicIn={withBitrate(getMetrics(data.publicIn))}
            publicOut={withBitrate(getMetrics(data.publicOut))}
          />
        </div>
      </React.Fragment>
    )
  }

  renderDiskIOChart = () => {
    const { classes } = this.props;
    const { rangeSelection, stats } = this.state;

    const data = {
      io: pathOr([[]], ['data','io','io'], stats),
      swap: pathOr([[]], ['data','io','swap'], stats)
    };


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
                borderColor: '#d01e1e',
                data: data.io,
                label: 'Disk I/O',
              },
              {
                borderColor: '#ffd100',
                data: data.swap,
                label: 'Swap I/O',
              },
            ]}
          />
        </div>
        <div className={classes.bottomLegend}>
          <DiskIOMetrics
            io={getMetrics(data.io)}
            swap={getMetrics(data.swap)}
          />
        </div>
      </React.Fragment>
    )
  }

  render() {
    const {
      linodeData: linode,
      imageData: image,
      volumesData: volumes,
      classes,
      typesData,
    } = this.props;

    const { dataIsLoading, statsError, rangeSelection } = this.state;

    // Shared props for all stats charts
    const chartProps = {
      loading: dataIsLoading,
      error: statsError,
      height: chartHeight
    }

    if (!linode || !volumes) {
      return null;
    }

    const longLabel = typeLabelLong(
      displayType(linode.type, typesData || []),
      linode.specs.memory,
      linode.specs.disk,
      linode.specs.vcpus,
    );

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linode.label} - Summary`} />
        <SummaryPanel linode={linode} image={image} volumes={volumes} typesLongLabel={longLabel} />

        <React.Fragment>
          <div className={classes.graphControls}>
            <Typography role="header" variant="title" className={classes.graphTitle}>
              Graphs
            </Typography>
            <FormControl style={{ marginTop: 0 }}>
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

        </React.Fragment>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const linodeContext = withLinode((context) => ({
  linodeCreated: context.data!.created,
  linodeId: context.data!.id,

  linodeData: context.data, /** @todo get rid of this */
}));

const imageContext = withImage((context) => ({
  imageData: context.data!,
}))

const typesContext = withTypes(({ data: typesData }) => ({ typesData }))

interface StateProps {
  volumesData?: Linode.Volume[]
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  volumesData: state.features.linodeDetail.volumes.data,
});

const connected = connect(mapStateToProps);

const enhanced = compose(
  connected,
  styled,
  typesContext,
  linodeContext,
  imageContext,
);

export default enhanced(LinodeSummary);
