import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
  updateLinode, powerOnLinode, powerOffLinode,
  rebootLinode,
} from '~/actions/api/linodes';
import { LinodePower } from '../components/LinodePower';
import Dropdown from '~/components/Dropdown';
import { LinodeStates, LinodeStatesReadable } from '~/constants';

class LinodeDetailPage extends Component {
  constructor() {
    super();
    this.getLinode = this.getLinode.bind(this);
    this.render = this.render.bind(this);
    this.powerOn = this.powerOn.bind(this);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
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

  render() {
    const linode = this.getLinode();
    if (!linode) return <span></span>;

    const ipAddresses = linode.ip_addresses;

    // Convert ip groups into an array
    const arrayifyIps = (pubPriv, type) => {
      let ips = ipAddresses[pubPriv][type];
      if (Array.isArray(pubPriv)) {
        return ips;
      } else if (!!ips) {
        return [ips];
      }
      return [];
    };

    const pubIpv4 = arrayifyIps('public', 'ipv4');
    const pubIpv6 = arrayifyIps('public', 'ipv6');
    const privIpv4 = arrayifyIps('private', 'ipv4');
    const privIpv6 = arrayifyIps('private', 'ipv6');
    const linkLocal = arrayifyIps('private', 'link_local');

    const renderIps = (ips) => ips.map(i => <div key={i}>{i}</div>);

    const dropdownElements = [
      { name: 'Reboot', _action: this.reboot },
      { name: 'Power off', _action: this.powerOff },
      { name: 'Power on', _action: this.powerOn },
    ].map(element => ({ ...element, action: () => element._action(linode) }));

    return (
      <div className="details-page">
        <div className="li-breadcrumb">
          <span><Link to="/linodes">Linodes</Link></span>
          <span>></span>
          <span>{linode.label}</span>
        </div>
        <div className="card">
          <header>
            <h1>{linode.label}</h1>
            <span className={`linode-status ${linode.state}`}>{LinodeStatesReadable[linode.state]}</span>
            <span className="pull-right">
              <Dropdown elements={dropdownElements} />
            </span>
          </header>
          <nav>
            <ul className="list-unstyled">
              <li className="active">General</li>
              <li>Backups</li>
              <li>Rescue</li>
              <li>Networking</li>
              <li>Advanced</li>
              <li className="linode-lish"><a href="/lish">Lish</a></li>
            </ul>
          </nav>
          <div className="linode-details row">
            <div className="col-sm-6">
              <ul className="list-unstyled">
                <li>
                  <span className="fa fa-link"></span>
                  {pubIpv4[0]}
                </li>
                <li>
                  <span className="fa fa-link invisible"></span>
                  {pubIpv6[0]}
                </li>
              </ul>
            </div>
            <div className="col-sm-6">
              <ul className="list-unstyled">
                <li>
                  <span className="fa fa-globe"></span>
                  {linode.datacenter.label}
                </li>
                <li>
                  <span className="fa fa-database"></span>
                  Last backup: 1 hour ago
                </li>
                <li>
                  <span className="fa fa-server"></span>
                  Linode 1024
                </li>
              </ul>
            </div>
          </div>
          <div className="linode-performance">
            <h2>Performance</h2>
            <div className="graph"></div>
          </div>
        </div>
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(LinodeDetailPage);
