import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { selectLinode } from '../../utilities';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';
import { addIP } from '~/api/linodes';
import { setSource } from '~/actions/source';
import { setError } from '~/actions/errors';
import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';


export class SummaryPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  addPrivateIP = async () => {
    const { dispatch, linode } = this.props;
    try {
      await dispatch(addIP(linode.id, 'private'));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  renderNameservers(isIpv4) {
    const dc = this.props.linode.region.id;
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
    const { ipv4 } = this.props.linode._ips;

    return (
      <div className="col-lg-6 col-md-12 col-sm-12">
        <h3>
          IPv4
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
    const { ipv6 } = this.props.linode._ips;

    return (
      <div className="col-lg-6 col-md-12 col-sm-12">
        <h3>
          IPv6
        </h3>
        <div className="row">
          <div className="col-sm-3 row-label">Address</div>
          <div className="col-sm-9">
            <div id="slaac">{ipv6.slaac.address} / {ipv6.slaac.prefix}</div>
            {ipv6.addresses.map(ip =>
              <div>{ip.address} / {ip.prefix}</div>)}
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
            {this.renderIps('linkLocal', [{ address: ipv6.link_local }])}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const nav = (
      <Button
        id="public-ip-button"
        className="float-sm-right"
        disabled
      >
        Add public IP address
      </Button>
    );

    return (
      <Card
        header={
          <CardHeader
            title="Summary"
            nav={nav}
          />
        }
      >
        <div className="row">
          {this.renderIPv4()}
          {this.renderIPv6()}
        </div>
      </Card>
    );
  }
}

SummaryPage.propTypes = {
  linode: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectLinode)(SummaryPage);
