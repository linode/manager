import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import HelpButton from '~/components/HelpButton';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';
import { setSource } from '~/actions/source';

export class SummaryPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderIPv4Public = this.renderIPv4Public.bind(this);
    this.renderIPv6Public = this.renderIPv6Public.bind(this);
    this.nameserversList = this.nameserversList.bind(this);
    this.ipList = this.ipList.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  ipList(ips) {
    return ips.map(ip => <li key={ip}>{ip}</li>);
  }

  nameserversList(isIPv4, linode) {
    const dc = linode.datacenter.id;
    const nameservers = (
      <div className="form-group row">
        <div className="col-sm-3 label-col left">
          Nameservers
        </div>
        <div className="col-sm-8 content-col right">
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

  renderIPv4Public() {
    const ipv4 = this.getLinode().ipv4;

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
          <div className="col-sm-8 content-col right">
            <ul className="list-unstyled">
              <span>
                <span>{ipv4}/24 </span>
                <span className="text-nowrap">
                  ( TO DO )
                </span>
              </span>
            </ul>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 label-col left">
            Gateway
          </div>
          <div className="col-sm-8 content-col right">
            {ipv4.substring(0, ipv4.lastIndexOf('.'))}.1
          </div>
        </div>
        {this.nameserversList(true, this.getLinode())}
      </div>
    );
  }

  renderIPv6Public() {
    /* FIXME link-local missing from API
     * const linkLocal = this.getLinode().ips['private'].link_local; FIXME add link-local
     */
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
          <div className="col-sm-8 content-col right">
            {this.getLinode().ipv6}
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-3 label-col left">
            Gateway
          </div>
          <div className="col-sm-8 content-col right">
            FIXME::1
          </div>
        </div>
        {this.nameserversList(false, this.getLinode())}
      </div>
    );
  }

  render() {
    /* TODO: Global Pool - IPv6
     * TODO: members.linode.com
     */
    const linkLocal = 'FIXME';
    /* FIXME link-local and private IP not found in API
     * const linkLocal = this.getLinode().ips['private'].link_local;
     * const ipPrivate = this.getLinode().ipv4.address;
     */

    return (
      <div>
        <section className="card">
          <header className="clearfix">
            <h2 className="float-xs-left">Public network</h2>
            <button type="button" id="public-ip-button" className="btn btn-default float-xs-right">
              Add public IP address
            </button>
          </header>
          <div className="row">
            {this.renderIPv4Public()}
            {this.renderIPv6Public()}
          </div>
        </section>

        <section className="card">
          <header className="clearfix">
            <h2 className="float-xs-left">Private network</h2>
            <button type="button" id="private-ip-button" className="btn btn-default float-xs-right">
              Add private IP address
            </button>
          </header>
          <div className="row">
            <div className="col-sm-6 left">
              <div className="form-group">
                {"No private IP addresses."}
              </div>
              <div className="form-group row">
                <div className="col-sm-3 label-col">
                  Link-local IP
                </div>
                <div className="col-sm-8 content-col">
                  {linkLocal}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

SummaryPage.propTypes = {
  linodes: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SummaryPage);
