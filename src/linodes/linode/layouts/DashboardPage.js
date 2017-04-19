import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { setError } from '~/actions/errors';
import Region from '~/linodes/components/Region';
import DistroStyle from '~/linodes/components/DistroStyle';
import PlanStyle from '~/linodes/components/PlanStyle';
import WeblishLaunch from '~/linodes/components/WeblishLaunch';
import GlishLaunch from '~/linodes/components/GlishLaunch';
import { selectLinode } from '../utilities';
import { setSource } from '~/actions/source';
import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import LineGraph from '~/components/graphs/LineGraph';
import { Select } from 'linode-components/forms';
import { getObjectByLabelLazily } from '~/api/util';
import { linodeStats } from '~/api/linodes';

function formatData(datasets, legends) {
  const x = datasets[0].map(([x]) => x);
  const ys = datasets.map(dataset => dataset.map(([, y]) => y));
  return LineGraph.formatData(x, ys, legends);
}

export class DashboardPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    let id;
    try {
      ({ id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel)));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      await dispatch(setError(e));
    }

    try {
      await dispatch(linodeStats([id]));
    } catch (e) {
      // Stats aren't available.
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      source: 'cpu',
      range: 'last1day',
    };

    const stats = props.linode._stats;
    if (stats) {
      this.graphs = {
        cpu: {
          title: 'CPU',
          yAxis: {
            label: 'Percentage of CPU(s) used',
            format: p => `${p.toFixed(1)}%`,
          },
          data: formatData([stats.cpu]),
        },
        io: {
          title: 'IO',
          yAxis: {
            label: 'Blocks per second',
            format: r => `${r.toFixed(1)} blocks/s`,
          },
          data: formatData([stats.io.io, stats.io.swap],
                           ['Disk', 'Swap']),
        },
        netv4: {
          title: 'IPv4 Network',
          yAxis: {
            label: 'Bits per second',
            format: r => `${r.toFixed()} bits/s`,
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
            format: r => `${r.toFixed()} bits/s`,
          },
          data: formatData([stats.netv6.in, stats.netv6.private_in,
                            stats.netv6.out, stats.netv6.private_out],
                           ['Public IPv6 Inbound', 'Private IPv6 Inbound',
                            'Public IPv6 Outbound', 'Private IPv6 Outbound']),
        },
      };
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  renderGraphs() {
    return (
      <Card header={<CardHeader title="Graphs" />} className="graphs">
        {!this.graphs ? <p>No graphs are available.</p> : (
          <div>
            <div className="clearfix">
              <div className="float-sm-left">
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
              <div className="float-sm-right">
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
          </div>
        )}
      </Card>
    );
  }

  renderDetails() {
    const { username, linode } = this.props;
    const plan = (<PlanStyle plan={linode.type[0]} />);
    const lishLink = `ssh -t ${
        username
      }@lish-${
        linode.region.id
      }.linode.com`;

    return (
      <div className="row-justify row-eq-height">
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card header={<CardHeader title="Summary" />}>
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
            <div className="row linode-region">
              <div className="col-sm-3 row-label">
                Region
              </div>
              <div className="col-sm-9">
                <Region obj={linode} />
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
          <Card header={<CardHeader title="Access" />}>
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
                  </span>
                  <span className="input-group-btn">
                    <WeblishLaunch linode={linode} />
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
                <div>
                  <GlishLaunch linode={linode} />
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
  linode: PropTypes.object,
  username: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { username } = state.authentication;
  return { linode, username };
}

export default connect(select)(DashboardPage);
