import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { getLinode } from './LinodeDetailPage';
import { countryMap } from '../components/DatacenterSelection';
import { flags, distros as distroAssets } from '~/assets';

export class LinodeGeneral extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
  }

  render() {
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
            <div className="col-sm-4 left">
              IP Addresses
            </div>
            <div className="col-sm-8 right">
              <ul className="list-unstyled">
                <li> {ipv4} </li>
                <li> {ipv6} </li>
                <li> <Link to={`/linodes/${linode.id}/networking`}>(...)</Link> </li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              Backups
            </div>
            <div className="col-sm-8 right">
              {linode.backups.enabled
                ? linode.backups.last_backup
                : <span>Backups not enabled. <i className="fa fa-exclamation-circle"></i></span>}
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
              <img
                src={flags[countryMap[linode.datacenter.id]]
                  ? flags[countryMap[linode.datacenter.id]] : '//placehold.it/50x50'}
                width="12" height="12" alt={linode.datacenter.label}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              Distribution
            </div>
            <div className="col-sm-8 right">
              {linode.distribution.label}
              <img
                src={distroAssets[linode.distribution.vendor]
                  ? distroAssets[linode.distribution.vendor] : '//placehold.it/50x50'}
                width="12" height="12" alt={linode.distribution.vendor}
              />
            </div>
          </div>
        </div>
        <div className="col-sm-7 right">
          <h2>Access</h2>
          <div className="row">
            <div className="col-sm-3 left">
              <label htmlFor="ssh-input">
                SSH
              </label>
            </div>
            <div className="col-sm-9 right">
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
            <div className="col-sm-3 left">
              <label htmlFor="lish-input">
                Text console
              </label>
            </div>
            <div className="col-sm-9 right">
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
                  <span className="btn question">( ? )</span>
                </span>
              </div>
              <small className="text-muted">
                Lish listens on ports 22, 443, and 2200.
              </small>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 left">
              <label htmlFor="glish-button">
                Graphical console
              </label>
            </div>
            <div className="col-sm-9 right">
              <div className="input-group">
                <button type="button" id="glish-button" className="btn btn-default">Open</button>
                <span className="btn question">( ? )</span>
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
