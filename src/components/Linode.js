import React, { Component } from 'react';
import { Link } from 'react-router';
import { LinodePower } from './LinodePower';

export class Linode extends Component {
  render() {
    const { linode, onPowerOn, onPowerOff, onReboot } = this.props;
    const pendingStates = [
        "booting",
        "rebooting",
        "shutting_down",
        "migrating",
        "provisioning",
        "deleting"
    ];
    const pending = pendingStates.indexOf(linode.state) !== -1;
    return (
      <div className={`linode card ${linode.state} ${pending ? 'pending' : ''}`}>
        <div className="row">
          <div className="col-md-9">
            <h4>
              <span data-title={linode.state} className={`status ${linode.state}`}></span>
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
              pending={pending}
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
          <i className="fa fa-plus" style={{marginLeft: '1rem'}}></i>
        </button>
      </div>
    );
  }
}
