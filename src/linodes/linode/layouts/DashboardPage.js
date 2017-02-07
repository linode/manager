import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';

import {
  renderBackupStatus,
  renderDistroStyle,
  renderDatacenterStyle,
  renderPlanStyle,
} from '~/linodes/components/Linode';
import { launchWeblishConsole } from '~/linodes/components/StatusDropdown';
import { getLinode } from './IndexPage';
import { linodeBackups } from '~/api/linodes';
import { setSource } from '~/actions/source';
import { Button } from '~/components/buttons';

export class DashboardPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderBackupStatus = renderBackupStatus.bind(this);
    this.renderDistroStyle = renderDistroStyle.bind(this);
    this.renderDatacenterStyle = renderDatacenterStyle.bind(this);
    this.renderPlanStyle = renderPlanStyle.bind(this);
    this.renderDetails = this.renderDetails.bind(this);
    this.renderGraphs = this.renderGraphs.bind(this);
    this.graphSelection = this.graphSelection.bind(this);
    this.graphUpdate = this.graphUpdate.bind(this);
    this.graphRangeUpdate = this.graphRangeUpdate.bind(this);
    this.graphSourceUpdate = this.graphSourceUpdate.bind(this);
    this.state = {
      source: 'cpu',
      range: 'last1day',
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    await dispatch(linodeBackups(linode.id));
    await dispatch(setSource(__filename));
  }

  graphRangeUpdate(value) {
    this.setState({ range: value });
  }
  graphSourceUpdate(value) {
    this.setState({ source: value });
  }

  graphSelection() {
    const source = this.state.source;
    const range = this.state.range;
    const now = new Date().getTime();
    const timeRange = {
      last1day: _.range(now - (1000 * 60 * 60 * 24 * 1), now, 5 * 60 * 1000),
      last2day: _.range(now - (1000 * 60 * 60 * 24 * 2), now, 15 * 60 * 1000),
      last7day: _.range(now - (1000 * 60 * 60 * 24 * 7), now, 60 * 60 * 1000),
    };
    const dataSource = {
      cpu: {
        name: 'CPU Usage',
        yLabel: 'CPU Usage %',
        xLabel: 'Sample Time',
        yDomain: { y: [0, 100] },
        range: 40,
      },
      disk: {
        name: 'Disk IO',
        yLabel: 'Block/sec',
        xLabel: 'Sample Time',
        yDomain: { y: [0, 70] },
        range: 40,
      },
      ipv4: {
        name: 'Networking IPv4',
        yLabel: 'bits/sec',
        xLabel: 'Sample Time',
        yDomain: { y: [0, 2] },
        range: 2,
      },
      ipv6: {
        name: 'Networking IPv6',
        yLabel: 'bits/sec',
        xLabel: 'Sample Time',
        yDomain: { y: [0, 60] },
        range: 40,
      },
    };
    return this.graphUpdate(dataSource[source], timeRange[range]);
  }

  graphUpdate(source, range) {
    const data = {
      data: [{
        name: source.name,
        values: range.map(ts => ({ x: ts, y: Math.random() * source.range })),
        strokeWidth: 2,
      }],
      yLabel: source.yLabel,
      xLabel: source.xLabel,
      yDomain: source.yDomain,
      xDomain: d => new Date(d.x),
    };
    return data;
  }

  renderGraphs() {
    return (
      <section className="card graphs">
        TODO
      </section>
    );

    /* Wait until the data exists because displaying this for not reals is too confusing.
    const graph = this.graphSelection();
    return (
      <section className="card graphs">
        <header>
          <h2>Performance</h2>
        </header>
        <div className="clearfix">
          <div className="float-xs-left">
            <select
              onChange={e => this.graphSourceUpdate(e.target.value)}
              className="form-control select-source"
            >
              <option value="cpu">CPU Usage</option>
              <option value="disk">Memory Usage</option>
              <option value="ipv4">IPv4 Network</option>
              <option value="ipv6">IPv6 Network</option>
            </select>
          </div>
          <div className="float-xs-right">
            <select
              onChange={e => this.graphRangeUpdate(e.target.value)}
              className="form-control select-range"
            >
              <option key={1} value="last1day">Last 24 hours</option>
              <option key={2} value="last2day">Last 48 hours</option>
              <option key={3} value="last7day">Last week</option>
            </select>
          </div>
        </div>
        <ResponsiveLineChart
          yAxisLabel={graph.yLabel}
          xAxisLabel={graph.xLabel}
          xAccessor={graph.xDomain}
          data={graph.data}
          domain={graph.yDomain}
          gridHorizontal
        />
      </section>
    );
    */
  }

  renderDetails() {
    const { username } = this.props;
    const linode = this.getLinode();
    const plan = this.renderPlanStyle(linode.type[0]);
    const lishLink = `ssh -t ${
        username
      }@lish-${
        linode.datacenter.id
      }.linode.com`;

    return (
      <div className="row-justify row-eq-height">
        <section className="col-lg-6 col-md-12">
          <div className="card">
            <header>
              <h2>Summary</h2>
            </header>
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
                {this.renderDatacenterStyle(linode)}
              </div>
            </div>
            <div className="row linode-distro">
              <div className="col-sm-3 row-label">
                Distribution
              </div>
              <div className="col-sm-9">
                {this.renderDistroStyle(linode)}
              </div>
            </div>
            <div className="row linode-backups">
              <div className="col-sm-3 row-label">
                Backup
              </div>
              <div className="col-sm-9">
                {this.renderBackupStatus(linode, true)}
              </div>
            </div>
          </div>
        </section>
        <section className="col-lg-6 col-md-12">
          <div className="card">
            <header>
              <h2>Access</h2>
            </header>
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
          </div>
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
