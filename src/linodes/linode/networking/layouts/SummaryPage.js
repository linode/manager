import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import HelpButton from '~/components/HelpButton';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';
import { linodeIPs, addIP } from '~/api/linodes';
import { setSource } from '~/actions/source';
import { setError } from '~/actions/errors';

export class SummaryPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

    try {
      await dispatch(linodeIPs(id));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderIPv4 = this.renderIPv4.bind(this);
    this.renderIPv6 = this.renderIPv6.bind(this);
    this.nameserversList = this.nameserversList.bind(this);
    this.addPrivateIP = this.addPrivateIP.bind(this);
    this.ipList = this.ipList.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  ipList(ips) {
    return ips.map(ip => <li key={ip}>{ip}</li>);
  }

  async addPrivateIP() {
    const { id } = this.getLinode();
    const { dispatch } = this.props;
    try {
      await dispatch(addIP(id, 'private'));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  nameserversList(isIPv4, linode) {
    const dc = linode.datacenter.id;
    const nameservers = (
      <div className="form-group row">
        <div className="col-sm-3 label-col left">
          Nameservers
        </div>
        <div className="col-sm-9 content-col right">
          <ul className="list-unstyled">
            {
              isIPv4 ?
              this.ipList(ipv4ns[dc]) :
              this.ipList(ipv6nsSuffix.map(
                suffix => ipv6ns[dc] + suffix
              ))
            }
          </ul>
        </div>
      </div>
    );

    return nameservers;
  }

  renderIPv4() {
    const ipv4 = this.getLinode()._ips.ipv4.public[0];

    let content = null;

    if (!this.getLinode()._ips.ipv4.private.length) {
      const bemPrefix = 'LinodesLinodeNetworkingSummaryPage-';
      content = (
        <button
          type="button"
          id="private-ip-button"
          className={`btn btn-default ${bemPrefix}addPrivateIp`}
          onClick={this.addPrivateIP}
          disabled
        >
          Enable private IP address
        </button>
      );
    } else {
      const ipv4 = this.getLinode()._ips.ipv4.private[0];

      content = (
        <div className="LinodesLinodeNetworkingSummaryPage-privateIpv4">
          <span>{ipv4.address}/17 </span>
          <span className="text-nowrap">
            ({ipv4.rdns})
          </span>
        </div>
      );
    }

    return (
      <div className="col-sm-6 left">
        <h3>
          IPv4
          <HelpButton
            to="https://www.linode.com/docs/networking/linux-static-ip-configuration"
          />
        </h3>
        <div className="form-group row">
          <div className="col-sm-3 label-col left">
            Address
          </div>
          <div className="col-sm-9 content-col right">
            <ul className="list-unstyled">
              <span>
                <span>{ipv4.address} </span>
                <span className="text-nowrap">
                  ({ipv4.rdns})
                </span>
              </span>
            </ul>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 label-col left">
            Subnet mask
          </div>
          <div className="col-sm-9 content-col right">
            255.255.255.0
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 label-col left">
            Gateway
          </div>
          <div className="col-sm-9 content-col right">
            {ipv4.address.substring(0, ipv4.address.lastIndexOf('.'))}.1
          </div>
        </div>
        {this.nameserversList(true, this.getLinode())}
        <div className="form-group row">
          <div>
            <div className="col-sm-3 label-col left">
              Private address
            </div>
            <div className="col-sm-9 content-col right">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderIPv6() {
    const linkLocal = this.getLinode()._ips.ipv6_ranges['link-local'];

    return (
      <div className="col-sm-6 right">
        <h3>
          IPv6
          <HelpButton
            to="https://www.linode.com/docs/networking/native-ipv6-networking"
          />
        </h3>
        <div className="form-group row">
          <div className="col-sm-3 label-col left">
            Address
          </div>
          <div className="col-sm-9 content-col right">
            {this.getLinode().ipv6}
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 label-col left">
            Gateway
          </div>
          <div className="col-sm-9 content-col right">
            fe80::1
          </div>
        </div>
        {this.nameserversList(false, this.getLinode())}
        <div className="form-group row">
          <div className="col-sm-3 label-col left">
            Link-local IP
          </div>
          <div className="col-sm-9 content-col right">
            <ul className="list-unstyled">
              <span>
                <span className="LinodesLinodeNetworkingSummaryPage-linkLocal">
                  {linkLocal}
                </span>
              </span>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <section className="card">
          <header className="clearfix">
            <h2 className="float-xs-left">Summary</h2>
            <button
              type="button"
              id="public-ip-button"
              className="btn btn-default float-xs-right"
              disabled
            >
              Add public IP address
            </button>
          </header>
          <div className="row">
            {this.renderIPv4()}
            {this.renderIPv6()}
          </div>
        </section>
      </div>
    );
  }
}

SummaryPage.propTypes = {
  linodes: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SummaryPage);
