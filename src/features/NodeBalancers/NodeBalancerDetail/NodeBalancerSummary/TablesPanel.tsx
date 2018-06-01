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
  | 'yellow'
  | 'dropdown';

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
    dropdown: {
      marginBottom: theme.spacing.unit * 3,
    },
  };
};

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
}

interface State {
  statsAsBits: Linode.NodeBalancerStats | null;
  selectedUnit?: StatsUnit;
  trafficUnits: StatsUnit[] | null;
  convertedStats: Linode.NodeBalancerStats | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const statsFetchInterval = 30000;

class TablesPanel extends React.Component<CombinedProps, State> {
  statsInterval: number;
  mounted: boolean = false;

  state: State = {
    statsAsBits: null,
    convertedStats: null,
    trafficUnits: null,
  };

  getStats = () => {
    const { nodeBalancer } = this.props;
    const { selectedUnit } = this.state;

    getNodeBalancerStats(nodeBalancer.id)
      .then((response: Linode.NodeBalancerStats) => {
        if (!this.mounted) { return; }
        // the reason for limiting which filters are available is because when a site has little
        // traffic, converting bits to GB may leave us with an exponential which doesn't render
        // properly in the chart component and displays an empty chart, so we need to limit
        // the choices available based on how much traffic the NodeBalancer has
        const trafficUnits: StatsUnit[] = (response &&
          isMuchTraffic([...response.data.traffic.in, ...response.data.traffic.out]))
          ? ['KB', 'MB', 'GB'] // we have a lot of traffic, so don't show bits or bytes
          : ['bits', 'bytes', 'KB', 'MB']; // we have little traffic, so don't show GB

        this.setState({
          trafficUnits,
          // getStats runs on an interval, so first check if we didn't already select a filter
          selectedUnit: selectedUnit || trafficUnits[0],
          statsAsBits: response, // original source of truth
          convertedStats: (trafficUnits[0] === 'bits' && selectedUnit === 'bits')
            ? response // don't do any converting since we're already getting bits from the API
            : convertStats(response, selectedUnit || trafficUnits[0]),
        });
      })
      .catch((errorResponse) => {
        if (!this.mounted) { return; }
      });
  }

  handleUnitChange = (value: StatsUnit) => {
    const { statsAsBits } = this.state;
    if (!statsAsBits) { return; }

    this.setState({
      selectedUnit: value,
      convertedStats: convertStats(statsAsBits, value),
    });
  }

  componentDidMount() {
    this.mounted = true;
    this.getStats();
    this.statsInterval = window.setInterval(() => this.getStats(), statsFetchInterval);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.clearInterval(this.statsInterval);
  }

  render() {
    const { classes } = this.props;
    const { selectedUnit, convertedStats, trafficUnits } = this.state;

    if (!convertedStats) { return null; }

    return (
      <React.Fragment>
        <div className={classes.graphControls}>
          <Typography variant="title" className={classes.graphTitle}>Graphs</Typography>
        </div>
        <ExpansionPanel
          defaultExpanded
          heading="Connections (5 min avg.)"
        >
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
                  data: convertedStats.data.connections,
                },
              ]}
            />
          </div>
        </ExpansionPanel>

        <ExpansionPanel
          defaultExpanded
          heading="Traffic (5 min avg.)"
        >
          <Typography variant="subheading">Units</Typography>
          <FormControl className={classes.dropdown} style={{ martginTop: 0 }}>
            <InputLabel htmlFor="chartRange" disableAnimation hidden>
              Select Time Range
                </InputLabel>
            <Select
              value={selectedUnit}
              // e.target.value will always come back as a StatsUnit below
              onChange={e => this.handleUnitChange(e.target.value as StatsUnit)}
              inputProps={{ name: 'unitType', id: 'unitType' }}
            >
              {trafficUnits!.map((unit, index) => {
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
                  data: convertedStats.data.traffic.in,
                },
                {
                  label: 'Traffic Out',
                  borderColor: '#01b159',
                  data: convertedStats.data.traffic.out,
                },
              ]}
            />
          </div>
          <div className={classes.bottomLegend}>
            <div className={classes.blue}>Inbound</div>
            <div className={classes.green}>Outbound</div>
          </div>
        </ExpansionPanel>
      </React.Fragment>
    );
  }
}

// if the traffic at any given time is greater than 1GB // otherwise, the traffic isn't that great
const isOverOneGB = (stat: number) => stat >= 1073741824;

const convertStats = (stats: Linode.NodeBalancerStats, value: StatsUnit) => {
  // map over each inbound and outbound traffic value and convert it from
  // one unit to another and return the new stats object
  return compose<Linode.NodeBalancerStats, Linode.NodeBalancerStats, Linode.NodeBalancerStats>(
    updateWithConvertedValue('in', value),
    updateWithConvertedValue('out', value),
  )(stats);
};

const updateWithConvertedValue = (key: 'in' | 'out', value: StatsUnit) => over(
  lensPath(['data', 'traffic', key]),
  map(stat => [stat[0], convertBitsToUnit(stat[1], value)]),
);

export const isMuchTraffic = (traffic: [number, number][]) => {
  // return whether or not we have high traffic in either in or out traffic
  let idx = 0;
  const len = traffic.length;

  for (; idx < len; idx += 1) {
    const [, bits] = traffic[idx];
    if (isOverOneGB(bits)) {
      return true;
    }
  }

  return false;
};

const styled = withStyles(styles, { withTheme: true });

export default styled(TablesPanel);
