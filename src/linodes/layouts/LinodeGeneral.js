import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { getLinode } from './LinodeDetailPage';

export class LinodeGeneral extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
  }

  render() {
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

    const ipv4 = arrayifyIps('public', 'ipv4');
    const ipv6 = arrayifyIps('public', 'ipv6');

    const username = 'caker';
    return (
      <div className="row">
        <div className="col-sm-6 left">
          <h2>Summary</h2>
          <div className="row">
            <div className="col-sm-4 left">
              IP Addresses
            </div>
            <div className="col-sm-8 right">
              <ul className="list-unstyled">
                <li> {ipv4} </li>
                <li> {ipv6} </li>
                <li> <Link to={`/linodes/${linode.id}`}>(...)</Link> </li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              Backups
            </div>
            <div className="col-sm-8 right">
              {linode.backups.enabled ? linode.backups.last_backup : 'Backups not enabled.'}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              Plan
            </div>
            <div className="col-sm-8 right">
              {linode.services.linode}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              Datacenter
            </div>
            <div className="col-sm-8 right">
              {linode.datacenter.label}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              Distribution
            </div>
            <div className="col-sm-8 right">
              {linode.distribution.label}
            </div>
          </div>
        </div>
        <div className="col-sm-6 right">
          <h2>Access</h2>
          <div className="row">
            <div className="col-sm-4 left">
              SSH
            </div>
            <div className="col-sm-8 right">
              <div className="input-group">
                <input type="text" className="form-control" value={`ssh root@${ipv4}`} readOnly />
                <span className="input-group-btn">
                  <button type="button" className="btn btn-default">SSH</button>
                </span>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              Text console
            </div>
            <div className="col-sm-8 right">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={
                    `ssh -t ${
                      username
                    }@lish-${
                      linode.datacenter.datacenter
                    }.linode.com`}
                  readOnly
                />
                <span className="input-group-btn">
                  <button type="button" className="btn btn-default">Open</button>
                </span>
              </div>
              <small className="text-muted">
                Lish listens on ports 22, 443, and 2200.
              </small>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              Graphic console
            </div>
            <div className="col-sm-8 right">
              <div className="input-group">
                <button type="button" className="btn btn-default">Open</button>
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
