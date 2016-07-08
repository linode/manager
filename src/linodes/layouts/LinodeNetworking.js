import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getLinode } from './LinodeDetailPage';
import HelpButton from '~/components/HelpButton';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';

export class LinodeNetworking extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderIPv4Public = this.renderIPv4Public.bind(this);
    this.renderIPv6Public = this.renderIPv6Public.bind(this);
    this.nameserversList = this.nameserversList.bind(this);
    this.ipList = this.ipList.bind(this);
  }

  ipList(ips) {
    return ips.map(ip => <li key={ip}>{ip}</li>);
  }

  nameserversList(isIPv4, linode) {
    const dc = linode.datacenter.id;
    const nameservers = (
      <div className="row">
        <div className="col-sm-4 linode-label-col left">
          Nameservers
        </div>
        <div className="col-sm-8 linode-content-col right">
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
    const ipv4 = this.getLinode().ip_addresses['public'].ipv4;

    return (
      <div className="col-sm-6 left">
        <div className="row">
          <div className="col-sm-12 left">
            <h3>
              IPv4
              <HelpButton
                to="https://www.linode.com/docs/networking/linux-static-ip-configuration"
              />
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 linode-label-col left">
            Inet
          </div>
          <div className="col-sm-8 linode-content-col right">
            <ul className="list-unstyled">
              {this.ipList(ipv4.map(
                ip => `${ip} / 24 ( li-${ip.split('.')[3]}.members.linode.com )`
              ))}
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 linode-label-col left">
            Gateway
          </div>
          <div className="col-sm-8 linode-content-col right">
            {ipv4[0].substring(0, ipv4[0].lastIndexOf('.'))}.1
          </div>
        </div>
        {this.nameserversList(true, this.getLinode())}
      </div>
    );
  }

  renderIPv6Public() {
    const linkLocal = this.getLinode().ip_addresses['private'].link_local;
    return (
      <div className="col-sm-6 right">
        <div className="row">
          <div className="col-sm-12 left">
            <h3>
              IPv6
              <HelpButton
                to="https://www.linode.com/docs/networking/native-ipv6-networking"
              />
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 linode-label-col left">
            Inet
          </div>
          <div className="col-sm-8 linode-content-col right">
            {this.getLinode().ip_addresses['public'].ipv6} / 64
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 linode-label-col left">
            Gateway
          </div>
          <div className="col-sm-8 linode-content-col right">
            {linkLocal.split(':')[0]}::1
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
    const linkLocal = this.getLinode().ip_addresses['private'].link_local;
    const ipPrivate = this.getLinode().ip_addresses['private'].ipv4;

    return (
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-sm-6 left">
              <h2>Public network</h2>
            </div>
            <div className="col-sm-6 right">
              <div className="input-group-btn">
                <button type="button" id="public-ip-button" className="btn btn-default pull-right">
                  Add IP address
                </button>
              </div>
            </div>
          </div>
          <div className="row network-content">
              {this.renderIPv4Public()}
              {this.renderIPv6Public()}
          </div>
          <div className="row">
            <div className="col-sm-4 left">
              <hr />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6 left">
              <h2>
                Private network
                <HelpButton
                  to="https://www.linode.com/docs/networking/linux-static-ip-configuration"
                />
              </h2>
            </div>
            <div className="col-sm-6 right">
              <div className="input-group-btn">
                <button type="button" id="private-ip-button" className="btn btn-default pull-right">
                  Add IP address
                </button>
              </div>
            </div>
          </div>
          <div className="row network-content">
            <div className="col-sm-6 left">
              {ipPrivate[0] ? (
                <div className="row">
                  <div className="col-sm-4 linode-label-col left">
                    Inet
                  </div>
                  <div className="col-sm-8 linode-content-col right">
                    {this.ipList(ipPrivate.map(
                      ip => `${ip} / 17`
                    ))}
                  </div>
                </div>
              ) : (
                <div className="row">
                  <div className="col-sm-12 linode-content-col right">
                    {"No private IP addresses."}
                  </div>
                </div>
              )}
              <div className="row">
                <div className="col-sm-4 linode-label-col left">
                  Link-local IP
                </div>
                <div className="col-sm-8 linode-content-col right">
                  {linkLocal}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LinodeNetworking.propTypes = {
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(LinodeNetworking);
