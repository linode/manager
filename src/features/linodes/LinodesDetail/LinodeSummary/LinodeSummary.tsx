import * as React from 'react';
import Axios from 'axios';
import { Line } from 'react-chartjs-2';

import { API_ROOT } from 'src/constants';
import transitionStatus from 'src/features/linodes/linodeTransitionStatus';
import ExpansionPanel from 'src/components/ExpansionPanel';

import LinodeBusyStatus from './LinodeBusyStatus';
import SummaryPanel from './SummaryPanel';

interface Props {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes: Linode.Volume[];
}

interface State {
  stats: Linode.TodoAny;
}

type FinalProps = Props;

const statToLabel = {
  cpu: 'CPU %',
  netv4: 'IPv4 Traffic',
  netv6: 'IPv6 Traffic',
  io: 'Disk I/O',
};

class LinodeSummary extends React.Component<FinalProps, State> {
  state: State = {
    stats: undefined,
  };

  getStats() {
    const { linode } = this.props;
    Axios.get(`${API_ROOT}/linode/instances/${linode.id}/stats`)
      .then(response => this.setState({ stats: response.data }));
  }

  componentDidMount() {
    this.getStats();
    window.setInterval(() => this.getStats(), 15000);
  }

  getChartJSDataFor(stat: string) {
    const { stats } = this.state;
    if (!stats) return {};

    const { data: { [stat]: data } } = stats;

    const timeData = data.reduce((acc: any, point: any) => {
      acc.push({ t: point[0], y: point[1] });
      return acc;
    }, []);

    return {
      datasets: [{
        label: statToLabel[stat],
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: '#428ade',
        borderWidth: 1,
        borderJoinStyle: 'miter',
        lineTension: 0,
        pointRadius: 0,
        pointHitRadius: 5,
        data: timeData,
      }],
    };
  }

  render() {
    const { linode, type, image, volumes } = this.props;
    const { stats } = this.state;
    return (
      <React.Fragment>
        {transitionStatus.includes(linode.status) &&
          <LinodeBusyStatus linode={linode} />
        }
        <SummaryPanel linode={linode} type={type} image={image} volumes={volumes} />
        <ExpansionPanel
          heading={statToLabel.cpu}
        >
          {stats &&
            <Line
              height={400}
              options={{
                maintainAspectRatio: false,
                animation: {
                  duration: 0,
                },
                legend: {
                  position: 'bottom',
                },
                scales: {
                  yAxes: [{
                    gridLines: {
                      borderDash: [3, 6],
                    },
                    scaleLabel: {
                      display: true,
                      labelString: 'CPU %',
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
              }}
              data={this.getChartJSDataFor('cpu') as any}
            />
          }
        </ExpansionPanel>
        <ExpansionPanel
          heading="IPv4 Traffic"
        >
          IPv4 Chart
        </ExpansionPanel>
        <ExpansionPanel
          heading="IPv6 Traffic"
        >
          IPv6 Chart
        </ExpansionPanel>
        <ExpansionPanel
          heading="Disk I/O"
        >
          Disk I/O
        </ExpansionPanel>
      </React.Fragment>
    );
  }
}

export default LinodeSummary;
