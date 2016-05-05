import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
  updateLinode, powerOnLinode, powerOffLinode,
  rebootLinode
} from '../actions/linodes';
import { LinodePower } from '../components/LinodePower';
import { LinodeStates } from '../constants';
import { readableStatus } from '../components/Linode';

class LinodeDetailPage extends Component {
  constructor() {
    super();
    this.getLinode = this.getLinode.bind(this);
    this.render = this.render.bind(this);
    this.powerOn = this.powerOn.bind(this);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
    this.renderPowerBox = this.renderPowerBox.bind(this);
  }

  getLinode() {
    const { linodes } = this.props.linodes;
    const { linodeId } = this.props.params;
    return linodes[linodeId];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      dispatch(updateLinode(linodeId));
    }
  }

  powerOn(linode) {
    const { dispatch } = this.props;
    dispatch(powerOnLinode(linode.id));
  }

  powerOff(linode) {
    const { dispatch } = this.props;
    dispatch(powerOffLinode(linode.id));
  }

  reboot(linode) {
    const { dispatch } = this.props;
    dispatch(rebootLinode(linode.id));
  }

  renderPowerBox(linode) {
    const pending = LinodeStates.pending.indexOf(linode.state) !== -1;
    return (
      <div className={`card power-management ${linode.state} ${pending ? 'pending' : ''}`}>
        <div className="row">
          <LinodePower linode={linode} cols={true}
            onPowerOn={l => this.powerOn(linode)}
            onPowerOff={l => this.powerOff(linode)}
            onReboot={l => this.reboot(linode)} />
        </div>
        {!linode._pending ? 
        <div className="row">
          <div className="col-md-12">
            <div className="text-centered" style={{paddingTop: '1rem'}}>
              {linode.label} is
              <strong>
                {' ' + linode.state}
              </strong>
            </div>
          </div>
        </div>
        : ''}
      </div>
    );
  }

  renderNetworkingBox(linode) {
    return (
      <div className="card info">
        <div style={{padding: '1rem'}}>
          <h4>Networking</h4>
          <ul className="list-unstyled">
            {linode.ip_addresses.public.ipv4.map(i => <li key={i}>{i}</li>)}
            <li>{linode.ip_addresses.public.ipv6}</li>
            <li><Link to={`/linodes/${linode.id}/ips`}>Manage IP addresses</Link></li>
          </ul>
          <h5>Bandwidth Usage</h5>
          <progress className="progress" value="20" max="100"></progress>
          <div className="text-centered">
            <small>14G of 1000G</small>
          </div>
        </div>
      </div>
    );
  }

  renderEvents(linode) {
    return (
      <div className="card info">
        <div style={{padding: '1rem'}}>
          <h4>Events</h4>
          <div>
            {/* TODO: Actual events */}
            <ul className="list-unstyled">
              <li className="row">
                <span className="col-md-1">
                  <i className="fa fa-spinner fa-spin"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Linode shutdown<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
              <li className="row">
                <span className="col-md-1">
                  <i className="text-success fa fa-check"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Linode Boot<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
              <li className="row">
                <span className="col-md-1">
                  <i className="text-danger fa fa-times"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Linode Boot<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
              <li className="row">
                <span className="col-md-1">
                  <i className="text-success fa fa-check"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Deploy distribution<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
              <li className="row">
                <span className="col-md-1">
                  <i className="text-success fa fa-check"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Initial Linode creation<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
            </ul>
            <div className="text-centered" style={{marginTop: '0.5rem'}}>
              <Link to={`/linodes/${linode.id}/events`}>More Events</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    let linode = this.getLinode();
    if (!linode) return "";

    let ipAddresses = linode.ip_addresses;

    let sanitizeIps = (pubPriv, type) => {
      let ips = ipAddresses[pubPriv][type];
      if (Array.isArray(pubPriv)) {
        return ips;
      } else if (!!ips) {
        return [ips];
      }
      return [];
    };

    let pubIpv4 = sanitizeIps("public", "ipv4");
    let pubIpv6 = sanitizeIps("public", "ipv6");
    let privIpv4 = sanitizeIps("private", "ipv4");
    let privIpv6 = sanitizeIps("private", "ipv6");
    let linkLocal = sanitizeIps("private", "link_local");

    let renderIps = (ips) => ips.map(i => <div>{i}</div>);

    return (
      <div className="details-page">
        <div className="li-breadcrumb">
          <span><Link to="/">Linodes</Link></span>
          <span>></span>
          <span>{linode.label}</span>
        </div>
        <div className="card header">
          <header>
            <h1>{linode.label}</h1>
            <span className={`linode-status ${linode.state}`}>{readableStatus[linode.state]}</span>
          </header>
          <table className="linode-details">
            <tbody>
              <tr>
                <td><span className="fa fa-server"></span></td>
                <td>1 GB RAM / 20 GB SSD / 1 Core</td>
              </tr>
              <tr>
                <td><span className="fa fa-globe"></span></td>
                <td>{linode.datacenter.label}</td>
              </tr>
              <tr>
                <td><span className="fa fa-database"></span></td>
                <td>Last backup: 1 hour ago</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card performance">
          <h2>Performance</h2>
          <div className="graph"></div>
        </div>
        <div className="card networking">
          <header>
            <h2>Networking</h2>
            <a href="#show-full" className="networking-full">Show full</a>
          </header>
          <div className="row">
            <div className="col-xs-6">
              <strong>Public IP Addresses</strong>
                <div>{renderIps(pubIpv4)}</div>
                <div>{renderIps(pubIpv6)}</div>
            </div>
            <div className="col-xs-6">
              <strong>Private IP Addresses</strong>
              <div>{renderIps(privIpv4)}</div>
              <div>{renderIps(privIpv6)}</div>
              <strong>Link-Local IP Addresses</strong>
              <div>{renderIps(linkLocal)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.linodes };
}

export default connect(select)(LinodeDetailPage);
