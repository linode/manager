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
import { getLinode, loadLinode } from './IndexPage';
import { ResponsiveLineChart } from '~/components/ResponsiveCharts';


export class DashboardPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
    this.renderBackupStatus = renderBackupStatus.bind(this);
    this.renderDistroStyle = renderDistroStyle.bind(this);
    this.renderDatacenterStyle = renderDatacenterStyle.bind(this);
    this.renderPlanStyle = renderPlanStyle.bind(this);
    this.componentDidMount = loadLinode.bind(this);
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

  componentDidMount() {
    this.loadLinode();
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
    const graph = this.graphSelection();
    return (
      <section className="card graphs">
        <h2>Performance</h2>
        <div className="row">
          <div className="col-md-2">
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
          <div className="col-md-offset-8 col-md-2">
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
  }

  renderDetails() {
    const { username } = this.props;
    const linode = this.getLinode();
    const plan = this.renderPlanStyle(linode.services);
    const lishLink = `ssh -t ${
        username
      }@lish-${
        linode.datacenter.id
      }.linode.com`;

    return (
      <section className="card">
        <div className="row">
          <div className="col-sm-5 left">
            <h2>Summary</h2>
            <div className="form-group row linode-ips">
              <div className="col-sm-4 label-col left">
                IP Addresses
              </div>
              <div className="col-sm-8 content-col right">
                <ul className="list-unstyled">
                  <li> {linode.ipv4.address} </li>
                  <li> {linode.ipv6.range} </li>
                  <li> <Link to={`/linodes/${linode.id}/networking`}>(...)</Link> </li>
                </ul>
              </div>
            </div>
            {plan ?
              <div className="form-group row linode-plan">
                <div className="col-sm-4 label-col left">
                  Plan
                </div>
                <div className="col-sm-8 content-col right">
                  {plan}
                </div>
              </div>
              : null
            }
            <div className="form-group row linode-datacenter">
              <div className="col-sm-4 label-col left">
                Datacenter
              </div>
              <div className="col-sm-8 content-col right">
                {this.renderDatacenterStyle(linode)}
              </div>
            </div>
            <div className="form-group row linode-distro">
              <div className="col-sm-4 label-col left">
                Distribution
              </div>
              <div className="col-sm-8 content-col right">
                {linode.distribution != null ? this.renderDistroStyle(linode) : 'Unknown'}
              </div>
            </div>
            <div className="form-group row linode-backups">
              <div className="col-sm-4 label-col left">
                Backup
              </div>
              <div className="col-sm-8 content-col right">
                {this.renderBackupStatus(linode)}
              </div>
            </div>
          </div>
          <div className="col-sm-7 right">
            <h2>Access</h2>
            <div className="form-group row linode-ssh">
              <div className="col-sm-3 label-col left">
                <label className="form-label" htmlFor="ssh-input">
                  SSH
                </label>
              </div>
              <div className="col-sm-9 content-col right">
                <div className="input-group">
                  <input
                    type="text"
                    id="ssh-input"
                    className="form-control"
                    value={`ssh root@${linode.ipv4.address}`}
                    readOnly
                  />
                  <span className="input-group-btn">
                    <button type="button" className="btn btn-default">SSH</button>
                  </span>
                </div>
              </div>
            </div>
            <div className="form-group row linode-lish">
              <div className="col-sm-3 label-col left">
                <label className="form-label" htmlFor="lish-input">
                  Text console
                </label>
              </div>
              <div className="col-sm-9 content-col right">
                <div className="input-group">
                  <input
                    type="text"
                    id="lish-input"
                    className="form-control"
                    value={lishLink}
                    readOnly
                  />
                  <span className="input-group-btn">
                    <button type="button" className="btn btn-default">SSH</button>
                    <button type="button" className="btn btn-default">Open</button>
                  </span>
                </div>
                <small className="text-muted">
                  Lish listens on ports 22, 443, and 2200.
                </small>
              </div>
            </div>
            <div className="form-group row linode-glish">
              <div className="col-sm-3 label-col left">
                <label className="form-label" htmlFor="glish-button">
                  Graphical console
                </label>
              </div>
              <div className="col-sm-9 content-col right">
                <div className="input-group-btn">
                  <button type="button" id="glish-button" className="btn btn-default">Open</button>
                </div>
                <small className="text-muted">
                  Equivalent to plugging a monitor and keyboard into your server.
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
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
    linodeId: PropTypes.string,
  }),
  username: PropTypes.string,
};

function select(state) {
  return {
    linodes: state.api.linodes,
    username: state.authentication.username,
  };
}

export default connect(select)(DashboardPage);
