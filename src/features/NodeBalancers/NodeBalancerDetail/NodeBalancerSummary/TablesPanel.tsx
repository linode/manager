import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import { MenuItem } from 'material-ui/Menu';
import { compose, over, lensPath, map } from 'ramda';

import LineGraph from 'src/components/LineGraph';
import ExpansionPanel from 'src/components/ExpansionPanel';
import { getNodeBalancerStats } from 'src/services/nodebalancers';
import Select from 'src/components/Select';

import { convertBitsToUnit } from 'src/utilities/convertBitsToUnit';

type ClassNames = 'chart'
  | 'leftLegend'
  | 'bottomLegend'
  | 'graphTitle'
  | 'graphControls'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow';

type StatsUnit = 'bits' | 'bytes' | 'KB' | 'MB' | 'GB';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  return {
    chart: {
      position: 'relative',
      width: '100%',
      paddingLeft: theme.spacing.unit * 4,
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

const dummyStats: Linode.NodeBalancerStats  = {
  title: 'dummy stats',
  data: {
    connections: [
      [1, 2],
      [2, 3],
    ],
    traffic: {
      in: [
        [1527705900000, 11.45],
        [1527706200000, 33.66],
        [1527706500000, 5.34],
        [1527706800000, 7.14],
        [1527707100000, 3.44],
        [1527707400000, 1547.94],
        [1527707700000, 1642.49],
        [1527708000000, 1133.22],
        [1527708300000, 20423442423434.81],
        [1527708600000, 1812.56],
        [1527708900000, 3595.13],
        [1527709200000, 3158.39],
        [1527709500000, 3158.39],
        [1527709800000, 678.62],
        [1527710100000, 3456.4],
        [1527710400000, 3324.1],
        [1527710700000, 2942.17],
        [1527711000000, 50.55],
        [1527711300000, 50.55],
        [1527711600000, 1229.14],
        [1527711900000, 2814.53],
      ],
      out: [
        [1527705900000, 11.45],
        [1527706200000, 33.66],
        [1527706500000, 5.34],
        [1527706800000, 7.14],
        [1527707100000, 3.44],
        [1527707400000, 1547.94],
        [1527707700000, 1642.49],
        [1527708000000, 1133.22],
        [1527708300000, 2034.81],
        [1527708600000, 1812.56],
        [1527708900000, 3595.13],
        [1527709200000, 3158.39],
        [1527709500000, 3158.39],
        [1527709800000, 678.62],
        [1527710100000, 3456.4],
        [1527710400000, 3324.1],
        [1527710700000, 2942.17],
        [1527711000000, 50.55],
        [1527711300000, 50.55],
        [1527711600000, 1229.14],
        [1527711900000, 2814.53],
      ],
    },
  },
};

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
}

interface State {
  stats: Linode.NodeBalancerStats | null;
  selectedUnit: string;
  convertedStats: Linode.NodeBalancerStats | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

// const statsFetchInterval = 30000;

class TablesPanel extends React.Component<CombinedProps, State> {
  statsInterval?: number = undefined;
  mounted: boolean = false;

  state: State = {
    stats: null,
    selectedUnit: 'bits',
    convertedStats: null,
  };

  getStats = () => {
    const { nodeBalancer } = this.props;
    getNodeBalancerStats(nodeBalancer.id)
      .then((response: Linode.NodeBalancerStats) => {
        if (!this.mounted) { return; }
        this.setState({ stats: dummyStats });
      })
      .catch((errorResponse) => {
        if (!this.mounted) { return; }
      });
  }

  handleUnitChange = (value: StatsUnit) => {
    const { stats } = this.state;
    if (!stats) { return; }

    const convertStats = compose<
      Linode.NodeBalancerStats,
      Linode.NodeBalancerStats,
      Linode.NodeBalancerStats
      >(
        over(
          lensPath(['data', 'traffic', 'in']),
          map(stat => [stat[0], convertBitsToUnit(stat[1], value)]),
        ),
        over(
          lensPath(['data', 'traffic', 'out']),
          map(stat => [stat[0], convertBitsToUnit(stat[1], value)]),
        ),
    );

    console.log(value);

    this.setState({
      selectedUnit: value,
      convertedStats: convertStats(stats!),
    });
  }

  isMuchTraffic = (stats: Linode.NodeBalancerStats) => {
    const isHighTraffic = (stat: [number, number][]) => stat.map((substat) => {
      if (substat[1] >= 1073741824) { // if the traffic at any given time is greater than 1GB
        return true;
      }
      return false; // otherwise, the traffic isn't that great
    });
    return [...isHighTraffic(stats.data.traffic.in), ...isHighTraffic(stats.data.traffic.out)]
      .some(isHigh => isHigh);
    // return whether or not we have high traffic in either in or out traffic
  }

  componentDidMount() {
    this.mounted = true;
    this.getStats();
    // this.statsInterval = window.setInterval(() => this.getStats(), statsFetchInterval);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.statsInterval as number);
  }

  render() {
    const { classes } = this.props;
    const { stats, selectedUnit, convertedStats } = this.state;

    // if we made a conversion, show the converted stats. Otherwise,
    // show the original statsToDisplay
    const statsToDisplay = (convertedStats) ? convertedStats : stats;

    // the reason for limiting which filters are available is because when a site has little
    // traffic, converting bits to GB may leave us with an exponential which doesn't render
    // properly in the chart component and displays an empty chart, so we need to limit
    // the choices available based on how much traffic the NodeBalancer has
    const trafficUnits = (stats && this.isMuchTraffic(stats))
      ? ['KB', 'MB', 'GB'] // we have a lot of traffic, so don't show bits or bytes
      : ['bits', 'bytes', 'KB', 'MB']; // we have little traffic, so don't show GB

    console.log(statsToDisplay);

    return (
      <React.Fragment>
        {statsToDisplay &&
          <React.Fragment>
            <div className={classes.graphControls}>
              <Typography variant="title" className={classes.graphTitle}>Graphs</Typography>
            </div>
            <ExpansionPanel
              defaultExpanded
              heading="Connections (5 min avg.)"
            >
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
                        borderColor: '#3683dc',
                        data: statsToDisplay.data.connections,
                      },
                    ]}
                  />
                </div>
              </React.Fragment>
            </ExpansionPanel>

            <ExpansionPanel
              defaultExpanded
              heading="Traffic (5 min avg.)"
            >
              <React.Fragment>
                <Typography variant="subheading">Units</Typography>
                <FormControl style={{ martginTop: 0 }}>
                  <InputLabel htmlFor="chartRange" disableAnimation hidden>
                    Select Time Range
                </InputLabel>
                  <Select
                    value={trafficUnits[0]}
                    // e.target.value will always come back as a StatsUnit below
                    onChange={e => this.handleUnitChange(e.target.value as StatsUnit)}
                    inputProps={{ name: 'unitType', id: 'unitType' }}
                  >
                    {trafficUnits.map((unit, index) => {
                      return <MenuItem key={index} value={unit}>{unit}</MenuItem>;
                    })
                    }
                  </Select>
                </FormControl>
                <div className={classes.chart}>
                  <div className={classes.leftLegend}>
                    {`${selectedUnit}/sec`}
                  </div>
                  <LineGraph
                    showToday={true}
                    data={[
                      {
                        label: 'Traffic In',
                        borderColor: '#3683dc',
                        data: statsToDisplay.data.traffic.in,
                      },
                      {
                        label: 'Traffic Out',
                        borderColor: '#01b159',
                        data: statsToDisplay.data.traffic.out,
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
            </ExpansionPanel>
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TablesPanel);

