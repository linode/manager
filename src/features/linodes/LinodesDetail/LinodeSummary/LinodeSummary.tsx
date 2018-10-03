import * as moment from 'moment';
import { compose } from 'ramda';
import * as React from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ExpansionPanel from 'src/components/ExpansionPanel';
import LineGraph from 'src/components/LineGraph';
import Select from 'src/components/Select';
import { withTypes } from 'src/context/types';
import { withImage, withLinode } from 'src/features/linodes/LinodesDetail/context';
import { displayType, typeLabelLong } from 'src/features/linodes/presentation';
import { getLinodeStats } from 'src/services/linodes';
import { setUpCharts } from 'src/utilities/charts';

import SummaryPanel from './SummaryPanel';

import { connect, MapStateToProps } from 'react-redux';

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
}

type CombinedProps = LinodeContextProps &
  TypesContextProps &
  WithStyles<ClassNames>;

const chartHeight = 300;

const statsFetchInterval = 30000;

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

  getStats() {
    const { linodeId } = this.props;
    const { rangeSelection } = this.state;
    if (!linodeId) { return; }

    let req;
    if (rangeSelection === '24') {
      req = getLinodeStats(linodeId);
    } else {
      const [year, month] = rangeSelection.split(' ');
      req = getLinodeStats(linodeId, year, month);
    }
    req
      .then((response) => {
        if (!this.mounted) { return; }

        this.setState({ statsLoadError: undefined });
        this.setState({ stats: response.data });
      })
      .catch((errorResponse) => {
        if (!this.mounted) { return; }
        /** disabling toast messages because they're annoying. */
        // if (pathOr(undefined, ['response', 'status'], errorResponse) === 429) {
        //   sendToast('Rate limit exceeded when fetching performance statistics', 'error');
        //   this.setState({ statsLoadError: 'rateLimited' });
        // } else {
        //   pathOr(
        //     [{ reason: 'Network Error when fetching performance statistics' }],
        //     ['response', 'data', 'errors'], errorResponse)
        //     .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
        //   this.setState({ statsLoadError: 'error' });
        // }

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

  handleChartRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    this.setState({ rangeSelection: value }, () => {
      this.getStats();
    });
  }

  render() {
    const {
      linodeData: linode,
      imageData: image,
      volumesData: volumes,
      classes,
      typesData,
    } = this.props;

    const { stats, rangeSelection } = this.state;

    if (!linode || !image || !volumes) {
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

        {stats &&
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

            <ExpansionPanel
              heading="CPU %"
            >
              <React.Fragment>
                <div className={classes.chart}>
                  <div className={classes.leftLegend}>
                    CPU %
                  </div>
                  <LineGraph
                    chartHeight={chartHeight}
                    showToday={rangeSelection === '24'}
                    suggestedMax={100}
                    data={[
                      {
                        borderColor: '#428ade',
                        data: stats.data.cpu,
                        label: 'CPU %',
                      },
                    ]}
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
            >
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
                        data: stats.data.netv4.in,
                        label: 'Public Traffic In',
                      },
                      {
                        borderColor: '#01b159',
                        data: stats.data.netv4.out,
                        label: 'Public Traffic Out',
                      },
                      {
                        borderColor: '#d01e1e',
                        data: stats.data.netv4.private_in,
                        label: 'Private Traffic In',
                      },
                      {
                        borderColor: '#ffd100',
                        data: stats.data.netv4.private_out,
                        label: 'Private Traffic Out',
                      },
                    ]}
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
            >
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
                        data: stats.data.netv6.in,
                        label: 'Public Traffic In',
                      },
                      {
                        borderColor: '#01b159',
                        data: stats.data.netv6.out,
                        label: 'Public Traffic Out',
                      },
                      {
                        borderColor: '#d01e1e',
                        data: stats.data.netv6.private_in,
                        label: 'Private Traffic In',
                      },
                      {
                        borderColor: '#ffd100',
                        data: stats.data.netv6.private_out,
                        label: 'Private Traffic Out',
                      },
                    ]}
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
            >
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
                        data: stats.data.io.io,
                        label: 'Disk I/O',
                      },
                      {
                        borderColor: '#ffd100',
                        data: stats.data.io.swap,
                        label: 'Swap I/O',
                      },
                    ]}
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
