import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';
import { linodeIPs, addIP } from '~/api/linodes';
import { setSource } from '~/actions/source';
import { setError } from '~/actions/errors';
import { Button } from '~/components/buttons';
import { Card } from '~/components/cards';
import { HelpButton } from '~/components';

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
    this.addPrivateIP = this.addPrivateIP.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
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

  renderNameservers(isIpv4) {
    const dc = this.getLinode().datacenter.id;
    const ipToObject = ip => ({ address: ip });
    const id = isIpv4 ? 'ipv4Nameservers' : 'ipv6Nameservers';
    const ips = isIpv4 ? ipv4ns[dc].map(ipToObject) :
                ipv6nsSuffix.map(suffix => ipToObject(ipv6ns[dc] + suffix));
    return this.renderIps(id, ips);
  }

  renderIps(id, ips) {
    const isIpv6 = prefix => ['17', '24'].indexOf(prefix) === -1;

    return (
      <ul className="list-unstyled" id={id}>
        {ips.map(({ address, prefix, rdns }) =>
          <li key={address}>
            <span className="text-nowrap">
              {address}{prefix && isIpv6(prefix) ? ` / ${prefix}` : null}
            </span>
            {rdns ? <div className="text-nowrap">({rdns})</div> : null}
          </li>
        )}
      </ul>
    );
  }

  renderIPv4() {
    const { ipv4 } = this.getLinode()._ips;

    return (
      <div className="col-sm-6">
        <h3>
          IPv4
          <HelpButton
            to="https://www.linode.com/docs/networking/linux-static-ip-configuration"
          />
        </h3>
        <div className="row">
          <div className="col-sm-3 row-label">Address</div>
          <div className="col-sm-9">{this.renderIps('publicIpv4', ipv4.public)}</div>
        </div>
        <div className="row">
          <div className="col-sm-3 row-label">Subnet mask</div>
          <div className="col-sm-9" id="ipv4Subnet">
            {ipv4.public[0].subnet_mask}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3 row-label">Gateway</div>
          <div className="col-sm-9" id="ipv4Gateway">
            {ipv4.public[0].gateway}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3 row-label">Nameservers</div>
          <div className="col-sm-9">{this.renderNameservers(true)}</div>
        </div>
        <div className="row">
          <div className="col-sm-3 row-label">Private address</div>
          <div className="col-sm-9">
            {ipv4.private.length ? this.renderIps('privateIpv4', ipv4.private) : (
              <Button
                id="addPrivateIp"
                onClick={this.addPrivateIP}
                disabled
              >
                Enable private IP address
              </Button>
             )}
          </div>
        </div>
      </div>
    );
  }

  renderIPv6() {
    const { ipv6 } = this.getLinode()._ips;

    return (
      <div className="col-sm-6">
        <h3>
          IPv6
          <HelpButton
            to="https://www.linode.com/docs/networking/native-ipv6-networking"
          />
        </h3>
        <div className="row">
          <div className="col-sm-3 row-label">Address</div>
          <div className="col-sm-9">
            {/* TODO: replace with proper prefix */}
            <div id="slaac">{ipv6.slaac} / {ipv6.prefix || '64'}</div>
            {ipv6.addresses.map(address =>
              <div>{address} / {ipv6.prefix || '64'}</div>)}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3 row-label">Gateway</div>
          {/* TODO: replace once gateways are returned */}
          <div className="col-sm-9">fe80::1</div>
        </div>
        <div className="row">
          <div className="col-sm-3 row-label">Nameservers</div>
          <div className="col-sm-9">{this.renderNameservers()}</div>
        </div>
        <div className="row">
          <div className="col-sm-3 row-label">Link-local IP</div>
          <div className="col-sm-9">
            {this.renderIps('linkLocal', [{ address: ipv6['link-local'] }])}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const nav = (
      <Button
        id="public-ip-button"
        className="float-xs-right"
        disabled
      >
        Add public IP address
      </Button>
    );

    return (
      <Card title="Summary" nav={nav}>
        <div className="row">
          {this.renderIPv4()}
          {this.renderIPv6()}
        </div>
      </Card>
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
