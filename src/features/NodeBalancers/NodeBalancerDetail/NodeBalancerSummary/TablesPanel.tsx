import { pathOr } from 'ramda';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExtendedExpansionPanel from 'src/components/ExtendedExpansionPanel';
import LineGraph from 'src/components/LineGraph';
import { getNodeBalancerStats } from 'src/services/nodebalancers';

type ClassNames = 'chart'
  | 'leftLegend'
  | 'bottomLegend'
  | 'graphTitle'
  | 'graphControls'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'header'
  | 'graphWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  return {
    header: {
      padding: theme.spacing.unit * 2,
    },
    graphWrapper: {
      marginTop: theme.spacing.unit * 2,
    },
    chart: {
      position: 'relative',
      width: '100%',
      padding: theme.spacing.unit * 4,
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
      padding: theme.spacing.unit * 2,
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
      marginTop: theme.spacing.unit * 2,
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

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
}

interface State {
  stats: Linode.NodeBalancerStats | null;
  loadingStats: boolean;
  openPanels: number;
  statsError?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const statsFetchInterval = 30000;

class TablesPanel extends React.Component<CombinedProps, State> {
  statsInterval?: number = undefined;
  mounted: boolean = false;

  state: State = {
    stats: null,
    loadingStats: false,
    openPanels: 0,
  };

  handleToggleExpand = (e: any, expanded: boolean) => {
    const { openPanels, stats } = this.state;
    if (expanded && !stats) {
      /* Only set loading state on initial load
      *  so the graphs are not disrupted on future updates. */
      this.setState({ loadingStats: true });
      this.getStats();
    }

    if (expanded && openPanels <= 0) {
      /* We will regularly update the stats as long as at least one panel is open. */
      this.statsInterval = window.setInterval(() => this.getStats(), statsFetchInterval);
    }

    /* If the panel is opening, increment the number of open panels. Otherwise decrement.
    *  This allows us to keep track of when all of the panels are closed.
    */
    const updatedOpenPanels = expanded ? openPanels + 1 : openPanels - 1;
    this.setState({ openPanels: updatedOpenPanels });

    /* If all panels are closed, stop updating the stats. */
    if (!expanded && updatedOpenPanels <= 0) {
      window.clearInterval(this.statsInterval as number);
    }
  }

  getStats = () => {
    const { nodeBalancer } = this.props;
    getNodeBalancerStats(nodeBalancer.id)
      .then((response: Linode.NodeBalancerStats) => {
        if (!this.mounted) { return; }
        this.setState({ stats: response, loadingStats: false, statsError: undefined });
      })
      .catch((errorResponse) => {
        if (!this.mounted) { return; }
        const statsError = pathOr("There was an error loading stats for this NodeBalancer.", ['reason'], errorResponse[0]);
        this.setState({ loadingStats: false, statsError });
      });
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.statsInterval as number);
  }

  renderConnectionsChart = () => {
    const { classes } = this.props;
    const { stats } = this.state;
    const data = pathOr([[]], ['data','connections'], stats);
    return (
      <React.Fragment>
        <Typography
          role="header"
          variant="h3"
          className={classes.header}
        >
          Connections (5 min avg.)
        </Typography>
        <React.Fragment>
          <div className={classes.chart}>
            <div className={classes.leftLegend} style={{ left: -34, bottom: 60 }}>
              connections/sec
              </div>
            <LineGraph
              showToday={true}
              data={[
                {
                  label: 'Connections',
                  borderColor: '#990066',
                  data,
                },
              ]}
            />
          </div>
        </React.Fragment>
      </React.Fragment>
    )
  }

  renderTrafficChart = () => {
    const { classes } = this.props;
    const { stats } = this.state;
    const trafficIn = pathOr([[]], ['data', 'traffic', 'in'], stats);
    const trafficOut = pathOr([[]], ['data', 'traffic', 'out'], stats);

    return (
      <React.Fragment>
        <Typography
          role="header"
          variant="h3"
          className={classes.header}
        >
          Traffic (5 min avg.)
        </Typography>
        <React.Fragment>
          <div className={classes.chart}>
            <div className={classes.leftLegend}>
              bits/sec
              </div>
            <LineGraph
              showToday={true}
              data={[
                {
                  label: 'Traffic In',
                  borderColor: '#3683dc',
                  data: trafficIn,
                },
                {
                  label: 'Traffic Out',
                  borderColor: '#01b159',
                  data: trafficOut,
                },
              ]}
            />
          </div>
          <div className={classes.bottomLegend}>
            <div className={classes.blue}>
              Inbound
              </div>
            <div className={classes.green}>
              Outbound
              </div>
          </div>
        </React.Fragment>
      </React.Fragment>
    )
  }

  render() {
    const { classes } = this.props;
    const { statsError, loadingStats } = this.state;
    return (
      <React.Fragment>
        <React.Fragment>
          <div className={classes.graphControls}>
            <Typography role="header" variant="h2" className={classes.graphTitle}>Graphs</Typography>
          </div>

          <ExtendedExpansionPanel
            renderMainContent={this.renderConnectionsChart}
            heading={"Connections"}
            error={statsError}
            loading={loadingStats}
            onChange={this.handleToggleExpand}
          />

          <ExtendedExpansionPanel
            className={classes.graphWrapper}
            heading={"Traffic"}
            renderMainContent={this.renderTrafficChart}
            error={statsError}
            loading={loadingStats}
            onChange={this.handleToggleExpand}
          />
        </React.Fragment>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(TablesPanel);
