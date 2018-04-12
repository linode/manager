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

const chartOptions = {
  maintainAspectRatio: false,
  animation: {
    duration: 0,
  },
  legend: {
    display: false,
  },
  scales: {
    yAxes: [{
      gridLines: {
        borderDash: [3, 6],
        zeroLineWidth: 1,
        zeroLineBorderDashOffset: 2,
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
};

const lineOptions = {
  backgroundColor: 'rgba(0, 0, 0, 0)',
  borderWidth: 1,
  borderJoinStyle: 'miter',
  lineTension: 0,
  pointRadius: 0,
  pointHitRadius: 5,
};

const statToLabel = {
  cpu: 'CPU %',
  netv4: 'IPv4 Traffic',
  netv6: 'IPv6 Traffic',
  io: 'Disk I/O',
};

const statToColor = {
  cpu: '#428ade',
  in: '#3683dc',
  out: '#01b159',
  private_in: '#d01e1e',
  private_out: '#ffd100',
  io: '#ffd100',
  swap: '#d01e1e',
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

  getChartJSDataFor(stat: string, data: [number, number][]) {
    const timeData = data.reduce((acc: any, point: any) => {
      acc.push({ t: point[0], y: point[1] });
      return acc;
    }, []);

    return {
      borderColor: statToColor[stat],
      data: timeData,
      ...lineOptions,
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
            <React.Fragment>
              <div>
                CPU %
              </div>
              <div>
                <Line
                  height={300}
                  options={chartOptions}
                  data={{
                    datasets: [
                      this.getChartJSDataFor('cpu', stats.data.cpu) as any,
                    ],
                  }}
                />
              </div>
              <div>
                CPU %
              </div>
            </React.Fragment>
          }
        </ExpansionPanel>

        <ExpansionPanel
          heading="IPv4 Traffic"
        >
          {stats &&
            <React.Fragment>
              <div>
                bits/sec
              </div>
              <div>
                <Line
                  height={300}
                  options={chartOptions}
                  data={{
                    datasets: [
                      this.getChartJSDataFor('in', stats.data.netv4.in) as any,
                      this.getChartJSDataFor('out', stats.data.netv4.out) as any,
                      this.getChartJSDataFor('private_in', stats.data.netv4.private_in) as any,
                      this.getChartJSDataFor('private_out', stats.data.netv4.private_out) as any,
                    ],
                  }}
                />
              </div>
              <div>
                Public IPv4 Inbound
              </div>
              <div>
                Public IPv4 Outbound
              </div>
              <div>
                Private IPv4 Inbound
              </div>
              <div>
                Private IPv4 Outbound
              </div>
            </React.Fragment>
          }
        </ExpansionPanel>

        <ExpansionPanel
          heading="IPv6 Traffic"
        >
          {stats &&
            <React.Fragment>
              <div>
                bits/sec
              </div>
              <div>
                <Line
                  height={300}
                  options={chartOptions}
                  data={{
                    datasets: [
                      this.getChartJSDataFor('in', stats.data.netv6.in) as any,
                      this.getChartJSDataFor('out', stats.data.netv6.out) as any,
                      this.getChartJSDataFor('private_in', stats.data.netv6.private_in) as any,
                      this.getChartJSDataFor('private_out', stats.data.netv6.private_out) as any,
                    ],
                  }}
                />
              </div>
              <div>
                Public IPv6 Inbound
              </div>
              <div>
                Public IPv6 Outbound
              </div>
              <div>
                Private IPv6 Inbound
              </div>
              <div>
                Private IPv6 Outbound
              </div>
            </React.Fragment>
          }
        </ExpansionPanel>

        <ExpansionPanel
          heading="Disk I/O"
        >
          {stats &&
            <React.Fragment>
              <div>
                bits/sec
              </div>
              <div>
                <Line
                  height={300}
                  options={chartOptions}
                  data={{
                    datasets: [
                      this.getChartJSDataFor('io', stats.data.io.io) as any,
                      this.getChartJSDataFor('swap', stats.data.io.swap) as any,
                    ],
                  }}
                />
              </div>
              <div>
                I/O Rate
              </div>
              <div>
                Swap Rate
              </div>
            </React.Fragment>
          }
        </ExpansionPanel>
      </React.Fragment>
    );
  }
}

export default LinodeSummary;
