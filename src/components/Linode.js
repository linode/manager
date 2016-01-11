import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

export class Linode extends Component {
  constructor() {
    super();
    this.renderPowerButtons = this.renderPowerButtons.bind(this);
  }

  renderPowerButtons() {
    const { linode } = this.props;
    switch (linode.status) {
    case "running":
      return (
        <div>
          <button className="btn btn-default btn-block btn-sm">
            Reboot
          </button>
          <button className="btn btn-default btn-block btn-sm">
            Shutdown
          </button>
        </div>
      );
    default:
      return (
        <button className="btn btn-default btn-block btn-sm">
          Power On
        </button>
      );
    }
  }

  render() {
    const { linode } = this.props;
    return (
      <div className="linode card">
        <div className="row">
          <div className="col-md-8">
            <h4>
              <span title={linode.status} className={`status ${linode.status}`}></span>
              {linode.label}
            </h4>
            <ul className="list-unstyled">
              { linode.ip_addresses.public.ipv4.map(a => <li key={a}>{a}</li>) }
              <li>{linode.ip_addresses.public.ipv6}</li>
            </ul>
          </div>
          <div className="col-md-4">
            {this.renderPowerButtons()}
          </div>
        </div>
      </div>
    );
  }
}
