import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { setError } from '~/actions/errors';
import Datacenter from '~/linodes/components/Datacenter';
import DistroStyle from '~/linodes/components/DistroStyle';
import PlanStyle from '~/linodes/components/PlanStyle';
import { launchWeblishConsole } from '~/linodes/components/StatusDropdown';
import { getLinode } from './IndexPage';
import { setSource } from '~/actions/source';
import { Button } from '~/components/buttons';
import { Card } from '~/components/cards';
import LineGraph from '~/components/graphs/LineGraph';
import { Select } from '~/components/form';
import { objectFromMapByLabel } from '~/api/util';
import { linodeStats } from '~/api/linodes';

function formatData(datasets, legends) {
  const x = datasets[0].map(([x]) => x);
  const ys = datasets.map(dataset => dataset.map(([, y]) => y));
  return LineGraph.formatData(x, ys, legends);
}

export class DashboardPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    try {
      const { id } = objectFromMapByLabel(getState().api.linodes.linodes, linodeLabel);
      await dispatch(linodeStats([id]));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setError(e));
    }
  }

  constructor(props) {
    super(props);

    this.getLinode = getLinode.bind(this);
    this.state = {
      source: 'cpu',
      range: 'last1day',
    };

    const stats = this.getLinode()._stats;
    this.graphs = {
      cpu: {
        title: 'CPU',
        yAxis: {
          label: 'Percentage of CPU(s) used',
          format: p => `${p}%`,
        },
        data: formatData([stats.cpu]),
      },
      io: {
        title: 'IO',
        yAxis: {
          label: 'Blocks per second',
          format: r => `${r} blocks/s`,
        },
        data: formatData([stats.io.io, stats.io.swap],
                         ['Disk', 'Swap']),
      },
      netv4: {
        title: 'IPv4 Network',
        yAxis: {
          label: 'Bits per second',
          format: r => `${r} bits/s`,
        },
        data: formatData([stats.netv4.in, stats.netv4.private_in,
                          stats.netv4.out, stats.netv4.private_out],
                         ['Public IPv4 Inbound', 'Private IPv4 Inbound',
                          'Public IPv4 Outbound', 'Private IPv4 Outbound']),
      },
      netv6: {
        title: 'IPv6 Network',
        yAxis: {
          label: 'Bits per second',
          format: r => `${r} bits/s`,
        },
        data: formatData([stats.netv6.in, stats.netv6.private_in,
                          stats.netv6.out, stats.netv6.private_out],
                         ['Public IPv6 Inbound', 'Private IPv6 Inbound',
                          'Public IPv6 Outbound', 'Private IPv6 Outbound']),
      },
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  renderGraphs() {
    return (
      <Card title="Performance" className="graphs">
        <div className="clearfix">
          <div className="float-xs-left">
            <Select
              value={this.state.source}
              name="source"
              onChange={this.onChange}
            >
              <option value="cpu">CPU</option>
              <option value="io">IO</option>
              <option value="netv4">IPv4 Network</option>
              <option value="netv6">IPv6 Network</option>
            </Select>
          </div>
          <div className="float-xs-right">
            <Select
              value={this.state.range}
              name="range"
              onChange={this.onChange}
              disabled
            >
              <option key={1} value="last1day">Last 24 hours</option>
              <option key={2} value="last2day">Last 48 hours</option>
              <option key={3} value="last7day">Last week</option>
            </Select>
          </div>
        </div>
        <LineGraph {...this.graphs[this.state.source]} />
      </Card>
    );
  }

  renderDetails() {
    const { username } = this.props;
    const linode = this.getLinode();
    const plan = (<PlanStyle plan={linode.type[0]} />);
    const lishLink = `ssh -t ${
        username
      }@lish-${
        linode.datacenter.id
      }.linode.com`;

    return (
      <div className="row-justify row-eq-height">
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card title="Summary">
            <div className="row linode-ips">
              <div className="col-sm-3 row-label">
                IP Addresses
              </div>
              <div className="col-sm-9">
                <ul className="list-unstyled">
                  <li>{linode.ipv4}</li>
                  <li className="text-muted">{linode.ipv6.split('/')[0]}</li>
                  <li><Link to={`/linodes/${linode.label}/networking`}>(...)</Link></li>
                </ul>
              </div>
            </div>
            {plan ?
              <div className="row linode-plan">
                <div className="col-sm-3 row-label">
                  Plan
                </div>
                <div className="col-sm-9">
                  {plan}
                </div>
              </div>
              : null
            }
            <div className="row linode-datacenter">
              <div className="col-sm-3 row-label">
                Datacenter
              </div>
              <div className="col-sm-9">
                <Datacenter obj={linode} />
              </div>
            </div>
            <div className="row linode-distro">
              <div className="col-sm-3 row-label">
                Distribution
              </div>
              <div className="col-sm-9">
                <DistroStyle linode={linode} />
              </div>
            </div>
            <div className="row linode-backups">
              <div className="col-sm-3 row-label">
                Backup
              </div>
              <div className="col-sm-9 backup-status">
                <Link to={`/linodes/${linode.label}/backups`}>
                  {linode.backups.enabled ? 'View Backups' : 'Enable Backups'}
                </Link>
              </div>
            </div>
          </Card>
        </section>
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card title="Access">
            <div className="form-group row linode-ssh">
              <label htmlFor="ssh-input" className="col-sm-4 col-form-label">
                SSH
              </label>
              <div className="col-sm-8">
                <div className="input-group">
                  <input
                    type="text"
                    id="ssh-input"
                    className="form-control"
                    value={`ssh root@${linode.ipv4}`}
                    readOnly
                  />
                  <span className="input-group-btn">
                    <Button>SSH</Button>
                  </span>
                </div>
              </div>
            </div>
            <div className="form-group row linode-lish">
              <label className="col-sm-4 col-form-label" htmlFor="lish-input">
                Text console
              </label>
              <div className="col-sm-8">
                <div className="input-group">
                  <input
                    type="text"
                    id="lish-input"
                    className="form-control"
                    value={lishLink}
                    readOnly
                  />
                  <span className="input-group-btn">
                    <Button>SSH</Button>
                    <Button onClick={() => launchWeblishConsole(linode)}>
                      Open
                    </Button>
                  </span>
                </div>
                <small className="text-muted">
                  Lish listens on ports 22, 443, and 2200.
                </small>
              </div>
            </div>
            <div className="form-group row linode-glish">
              <label className="col-sm-4 col-form-label" htmlFor="glish-button">
                Graphical console
              </label>
              <div className="col-sm-8">
                <div className="input-group-btn">
                  <Button id="glish-button" disabled>Open</Button>
                </div>
                <small className="text-muted">
                  Equivalent to plugging a monitor and keyboard into your server.
                </small>
              </div>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderDetails()}
        {this.renderGraphs()}
      </div>
    );
  }
}

DashboardPage.propTypes = {
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
  }),
  username: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    linodes: state.api.linodes,
    username: state.authentication.username,
  };
}

export default connect(select)(DashboardPage);
