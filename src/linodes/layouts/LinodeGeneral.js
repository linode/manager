import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {
  renderBackupStatus,
  renderDistroStyle,
  renderDatacenterStyle,
  renderPlanStyle,
} from '~/linodes/components/Linode';
import { getLinode, updateLinode } from './LinodeDetailPage';
import { ResponsiveLineChart } from '~/components/ResponsiveCharts';
import _ from 'lodash';

export class LinodeGeneral extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderBackupStatus = renderBackupStatus.bind(this);
    this.renderDistroStyle = renderDistroStyle.bind(this);
    this.renderDatacenterStyle = renderDatacenterStyle.bind(this);
    this.renderPlanStyle = renderPlanStyle.bind(this);
    this.componentDidMount = updateLinode.bind(this);
    this.renderDetails = this.renderDetails.bind(this);
    this.renderGraphs = this.renderGraphs.bind(this);
  }

  renderGraphs() {
    const now = new Date().getTime() / 1000;
    const data = [
      {
        name: 'CPU Usage',
        values: _.range(now - 86400, now, 30 * 60)
          .map(ts => ({ x: ts, y: Math.random() * 5 })),
        strokeWidth: 2,
      },
    ];
    return (
      <div className="graphs">
        <h2>Performance</h2>
        <div className="card">
          <div className="row">
            <div className="col-md-2">
              <select className="form-control">
                <option>CPU Usage</option>
                <option>Memory Usage</option>
                <option>Swap</option>
                <option>Network</option>
              </select>
            </div>
            <div className="col-md-offset-8 col-md-2">
              <select className="form-control">
                <option>Last 24 hours</option>
                <option>Last 48 hours</option>
                <option>Last week</option>
              </select>
            </div>
          </div>
          <ResponsiveLineChart
            yAxisLabel="CPU Usage %"
            xAxisLabel="Sample Time"
            xAccessor={d => new Date(d.x)}
            data={data}
            domain={{ y: [0, 100] }}
            gridHorizontal
          />
        </div>
      </div>
    );
  }

  renderDetails() {
    const username = 'caker';
    const linode = this.getLinode();
    const ipAddresses = linode.ip_addresses;
    const arrayifyIps = (pubPriv, type) => {
      const ips = ipAddresses[pubPriv][type];
      if (Array.isArray(pubPriv)) {
        return ips;
      } else if (!!ips) {
        return [ips];
      }
      return [];
    };

    const lishLink = `ssh -t ${
        username
      }@lish-${
        linode.datacenter.datacenter
      }.linode.com`;

    const ipv4 = arrayifyIps('public', 'ipv4');
    const ipv6 = arrayifyIps('public', 'ipv6');

    return (
      <div className="row">
        <div className="col-sm-5 left">
          <h2>Summary</h2>
          <div className="row">
            <div className="col-sm-4 linode-label-col left">
              IP Addresses
            </div>
            <div className="col-sm-8 linode-content-col right">
              <ul className="list-unstyled">
                <li> {ipv4} </li>
                <li> {ipv6} </li>
                <li> <Link to={`/linodes/${linode.id}/networking`}>(...)</Link> </li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 linode-label-col left">
              Backups
            </div>
            <div className="col-sm-8 linode-content-col right">
              {this.renderBackupStatus(linode)}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 linode-label-col left">
              Plan
            </div>
            <div className="col-sm-8 linode-content-col right">
              {this.renderPlanStyle(linode)}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 linode-label-col left">
              Datacenter
            </div>
            <div className="col-sm-8 linode-content-col right">
              {this.renderDatacenterStyle(linode)}
            </div>
          </div>
          {linode.distribution != null ?
            <div className="row">
              <div className="col-sm-4 linode-label-col left">
                Distribution
              </div>
              <div className="col-sm-8 linode-content-col right">
                {this.renderDistroStyle(linode)}
              </div>
            </div>
            : null
          }
        </div>
        <div className="col-sm-7 right">
          <h2>Access</h2>
          <div className="row">
            <div className="col-sm-3 linode-label-col left">
              <label className="form-label" htmlFor="ssh-input">
                SSH
              </label>
            </div>
            <div className="col-sm-9 linode-content-col right">
              <div className="input-group">
                <input
                  type="text"
                  id="ssh-input"
                  className="form-control"
                  value={`ssh root@${ipv4}`}
                  readOnly
                />
                <span className="input-group-btn">
                  <button type="button" className="btn btn-default">SSH</button>
                </span>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 linode-label-col left">
              <label className="form-label" htmlFor="lish-input">
                Text console
              </label>
            </div>
            <div className="col-sm-9 linode-content-col right">
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
          <div className="row">
            <div className="col-sm-3 linode-label-col left">
              <label className="form-label" htmlFor="glish-button">
                Graphical console
              </label>
            </div>
            <div className="col-sm-9 linode-content-col right">
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

LinodeGeneral.propTypes = {
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(LinodeGeneral);
