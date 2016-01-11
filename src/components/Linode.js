import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';

export class Linode extends Component {
  constructor() {
    super();
    this.renderPowerButtons = this.renderPowerButtons.bind(this);
  }

  renderPowerButtons() {
    const { linode, onPowerOn } = this.props;
    switch (linode.status) {
    case "running":
      return (
        <div className="power">
          <button className="btn btn-default btn-block btn-sm">
            <i className="fa fa-power-off"></i>
            <span className="hover">OFF</span>
            &nbsp;
          </button>
          <button className="btn btn-default btn-block btn-sm">
            <i className="fa fa-refresh"></i>
            <span className="hover">Reboot</span>
            &nbsp;
          </button>
        </div>
      );
    case "brand_new":
      return (
        <div className="power">
          <button onClick={onPowerOn} className="btn btn-default btn-block btn-sm">
            <i className="fa fa-power-off"></i>
            <span className="hover">ON</span>
            &nbsp;
          </button>
        </div>
      );
    default:
      return (
        <div className="power">
          <button className="btn btn-default btn-block btn-sm">
            <i className="fa fa-power-off"></i>
            <span className="hover">ON</span>
            &nbsp;
          </button>
        </div>
      );
    }
  }

  render() {
    const { linode } = this.props;
    return (
      <div className={`linode card ${linode.status}`}>
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
            {this.renderPowerButtons()}
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
