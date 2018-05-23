import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';

import ExpansionPanel from 'src/components/ExpansionPanel';
import { getNodeBalancerStats } from 'src/services/nodebalancers';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
}

interface State {
  stats: Linode.NodeBalancerStats | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

// const chartOptions: any = {
//   maintainAspectRatio: false,
//   animation: {
//     duration: 0,
//   },
//   legend: {
//     display: false,
//   },
//   scales: {
//     yAxes: [{
//       gridLines: {
//         borderDash: [3, 6],
//         zeroLineWidth: 1,
//         zeroLineBorderDashOffset: 2,
//       },
//       ticks: {
//         beginAtZero: true,
//         callback(value: number, index: number) {
//           if (value >= 1000000) {
//             return (value / 1000000) + 'M';
//           }
//           if (value >= 1000) {
//             return (value / 1000) + 'K';
//           }
//           return value;
//         },
//       },
//     }],
//     xAxes: [{
//       type: 'time',
//       gridLines: {
//         display: false,
//       },
//       time: {
//         displayFormats: {
//           hour: 'HH:00',
//           minute: 'HH:00',
//         },
//       },
//     }],
//   },
//   tooltips: {
//     cornerRadius: 0,
//     backgroundColor: '#fbfbfb',
//     bodyFontColor: '#333',
//     displayColors: false,
//     titleFontColor: '#666',
//     xPadding: 16,
//     yPadding: 10,
//     borderWidth: .5,
//     borderColor: '#999',
//     caretPadding: 10,
//     position: 'nearest',
//   },
// };

// const statToColor = {
//   connections: '#428ade',
//   in: '#3683dc',
//   out: '#01b159',
// };

// looking at LinodeSummary as a point of reference

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
        console.log(response);
        this.setState({ stats: response });
      })
      .catch((errorResponse) => {
        if (!this.mounted) { return; }
      });
  }

  componentDidMount() {
    this.mounted = true;
    this.getStats();
    // this.statsInterval = window.setInterval(() => this.getStats(), statsFetchInterval);
  }

  componentWillUnmount() {
    this.mounted = false;
    // window.clearInterval(this.statsInterval as number);
  }

  render() {
    console.log(this.state.stats);
    return (
      <React.Fragment>
        <Typography variant="title">Graphs</Typography>
        <ExpansionPanel heading="Connections">
        </ExpansionPanel>
        <ExpansionPanel heading="Traffic">
        </ExpansionPanel>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TablesPanel);

