import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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
}

type CombinedProps = Props & WithStyles<ClassNames>;

const statsFetchInterval = 30000;

class TablesPanel extends React.Component<CombinedProps, State> {
  statsInterval?: number = undefined;
  mounted: boolean = false;

  state: State = {
    stats: null,
  };

  getStats = () => {
    const { nodeBalancer } = this.props;
    getNodeBalancerStats(nodeBalancer.id)
      .then((response: Linode.NodeBalancerStats) => {
        if (!this.mounted) { return; }
        this.setState({ stats: response });
      })
      .catch((errorResponse) => {
        if (!this.mounted) { return; }
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

  render() {
    const { classes } = this.props;
    const { stats } = this.state;
    return (
      <React.Fragment>
        {stats &&
          <React.Fragment>
            <div className={classes.graphControls}>
              <Typography role="header" variant="title" className={classes.graphTitle}>Graphs</Typography>
            </div>
          <Paper>
            <Typography
              role="header"
              variant="subheading"
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
                      data: stats.data.connections,
                    },
                  ]}
                />
              </div>
            </React.Fragment>
          </Paper>
          <Paper className={classes.graphWrapper}>
            <Typography
              role="header"
              variant="subheading"
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
                      data: stats.data.traffic.in,
                    },
                    {
                      label: 'Traffic Out',
                      borderColor: '#01b159',
                      data: stats.data.traffic.out,
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
          </Paper>
        </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TablesPanel);
