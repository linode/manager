import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';
import { LinodePower } from './LinodePower';

export class Linode extends Component {
  constructor() {
    super();
  }

  render() {
    const { linode, onPowerOn, onPowerOff, onReboot } = this.props;
    return (
      <div className={`linode card ${linode.status} ${linode._pending ? 'pending' : ''}`}>
        <div className="row">
          <div className="col-md-9">
            <h4>
              <span data-title={linode.status} className={`status ${linode.status}`}></span>
              <Link to={`/linodes/${linode.id}`}>
                {linode.label}
              </Link>
            </h4>
            <ul className="list-unstyled">
              <li>{linode.datacenter.label}</li>
              { linode.ip_addresses.public.ipv4.map(a => <li key={a}>{a}</li>) }
              <li>{linode.ip_addresses.public.ipv6}</li>
            </ul>
          </div>
          <div className="col-md-3">
            <LinodePower
              linode={linode}
              onPowerOn={onPowerOn}
              onPowerOff={onPowerOff}
              onReboot={onReboot} />
          </div>
        </div>
      </div>
    );
  }
}

export class NewLinode extends Component {
  render() {
    return (
      <div className="card new-linode">
        <button className="btn btn-success">
          <i className="fa fa-plus" style={{marginLeft: "1rem"}}></i>
        </button>
      </div>
    );
  }
}
