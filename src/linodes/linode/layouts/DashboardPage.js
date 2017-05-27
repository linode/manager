import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { FormGroup, Input, Select } from 'linode-components/forms';

import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { getObjectByLabelLazily } from '~/api/util';
import { linodeStats } from '~/api/linodes';
import LineGraph from '~/components/graphs/LineGraph';
import { DATACENTERS } from '~/constants';
import Region from '~/linodes/components/Region';
import DistroStyle from '~/linodes/components/DistroStyle';
import PlanStyle from '~/linodes/components/PlanStyle';
import WeblishLaunch from '~/linodes/components/WeblishLaunch';

import { selectLinode } from '../utilities';


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
          unit: '%',
        },
        io: {
          title: 'IO',
          yAxis: {
            label: 'Blocks per second',
            format: r => `${r.toFixed(1)} blocks/s`,
          },
          data: formatData([stats.io.io, stats.io.swap],
                           ['Disk', 'Swap']),
          unit: ' blocks/s',
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
          unit: ' bits/s',
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
          unit: ' bits/s',
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
    const { timezone } = this.props;
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
                Last 24 hours
              </div>
            </div>
            <LineGraph
              timezone={timezone}
              {...this.graphs[this.state.source]}
            />
          </div>
        )}
      </Card>
    );
  }

  renderDetails() {
    const { username, linode } = this.props;
    const plan = (<PlanStyle plan={linode.type} />);
    const lishLink = `${username}@lish-${DATACENTERS[linode.region.id]}.linode.com`;

    return (
      <div className="row">
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card header={<CardHeader title="Summary" />} className="full-height">
            <div className="row">
              <div className="col-sm-4 row-label">
                IP Addresses
              </div>
              <div className="col-sm-8">
                <ul className="list-unstyled" id="ips">
                  <li>{linode.ipv4}</li>
                  <li className="text-muted">{linode.ipv6.split('/')[0]}</li>
                  <li><Link to={`/linodes/${linode.label}/networking`}>(...)</Link></li>
                </ul>
              </div>
            </div>
            {!plan ? null : (
              <div className="row">
                <div className="col-sm-4 row-label">Plan</div>
                <div className="col-sm-8" id="plan">{plan}</div>
              </div>
            )}
            <div className="row">
              <div className="col-sm-4 row-label">Region</div>
              <div className="col-sm-8" id="region"><Region obj={linode} /></div>
            </div>
            <div className="row">
              <div className="col-sm-4 row-label">Distribution</div>
              <div className="col-sm-8" id="distro"><DistroStyle linode={linode} /></div>
            </div>
            <div className="row linode-backups">
              <div className="col-sm-4 row-label">Backup</div>
              <div className="col-sm-8" id="backup-status">
                <Link to={`/linodes/${linode.label}/backups`}>
                  {linode.backups.enabled ? 'View Backups' : 'Enable Backups'}
                </Link>
              </div>
            </div>
          </Card>
        </section>
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card header={<CardHeader title="Access" />} className="full-height">
            <FormGroup className="row">
              <label htmlFor="ssh-input" className="col-sm-4 col-form-label">SSH</label>
              <div className="col-sm-8">
                <div className="input-group">
                  <Input
                    id="ssh-input"
                    value={`ssh root@${linode.ipv4}`}
                    readOnly
                  />
                  <span className="input-group-btn">
                    <Button href={`ssh://root@${linode.ipv4}`}>SSH</Button>
                  </span>
                </div>
              </div>
            </FormGroup>
            <FormGroup className="row">
              <label className="col-sm-4 col-form-label" htmlFor="lish-input">
                Console
              </label>
              <div className="col-sm-8">
                <div className="input-group">
                  <Input
                    id="lish-input"
                    value={`ssh -t ${lishLink}`}
                    readOnly
                  />
                  <span className="input-group-btn">
                    <Button href={`ssh://${lishLink}`}>SSH</Button>
                  </span>
                  <span className="input-group-btn">
                    <WeblishLaunch linode={linode} />
                  </span>
                </div>
                <small className="text-muted">
                  Lish listens on ports 22, 443, and 2200.
                </small>
              </div>
            </FormGroup>
          </Card>
        </section>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderDetails()}
        <div className="row">
          <div className="col-sm-12">
            {this.renderGraphs()}
          </div>
        </div>
      </div>
    );
  }
}

DashboardPage.propTypes = {
  linode: PropTypes.object,
  username: PropTypes.string,
  timezone: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { username, timezone } = state.api.profile;
  return { linode, username, timezone };
}

export default connect(select)(DashboardPage);
