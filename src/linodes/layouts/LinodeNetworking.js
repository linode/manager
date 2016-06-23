import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getLinode } from './LinodeDetailPage';
import HelpButton from '~/components/HelpButton';

export const ipv4ns = {
  dallas: [
    '173.255.199.5',
    '66.228.53.5',
    '96.126.122.5',
    '96.126.124.5',
    '96.126.127.5',
    '198.58.107.5',
    '198.58.111.5',
    '23.239.24.5',
    '72.14.179.5',
    '72.14.188.5'],
  fremont: [
    '173.230.145.5',
    '173.230.147.5',
    '173.230.155.5',
    '173.255.212.5',
    '173.255.219.5',
    '173.255.241.5',
    '173.255.243.5',
    '173.255.244.5',
    '74.207.241.5',
    '74.207.242.5'],
  atlanta: [
    '173.230.129.5',
    '173.230.136.5',
    '173.230.140.5',
    '66.228.59.5',
    '66.228.62.5',
    '50.116.35.5',
    '50.116.41.5',
    '23.239.18.5',
    '75.127.97.6',
    '75.127.97.7'],
  newark: [
    '66.228.42.5',
    '96.126.106.5',
    '50.116.53.5',
    '50.116.58.5',
    '50.116.61.5',
    '50.116.62.5',
    '66.175.211.5',
    '97.107.133.4',
    '207.192.69.4',
    '207.192.69.5'],
  london: [
    '178.79.182.5',
    '176.58.107.5',
    '176.58.116.5',
    '176.58.121.5',
    '151.236.220.5',
    '212.71.252.5',
    '212.71.253.5',
    '109.74.192.20',
    '109.74.193.20',
    '109.74.194.20'],
  tokyo: [
    '106.187.90.5',
    '106.187.93.5',
    '106.187.94.5',
    '106.187.95.5',
    '106.186.116.5',
    '106.186.123.5',
    '106.186.124.5',
    '106.187.34.20',
    '106.187.35.20',
    '106.187.36.20'],
  singapore: [
    '139.162.11.5',
    '139.162.13.5',
    '139.162.14.5',
    '139.162.15.5',
    '139.162.16.5',
    '139.162.21.5',
    '139.162.27.5',
    '103.3.60.18',
    '103.3.60.19',
    '103.3.60.20'],
  frankfort: [
    '139.162.130.5',
    '139.162.131.5',
    '139.162.132.5',
    '139.162.133.5',
    '139.162.134.5',
    '139.162.135.5',
    '139.162.136.5',
    '139.162.137.5',
    '139.162.138.5',
    '139.162.139.5'],
};
export const ipv6ns = {
  dallas: '2600:3c00::',
  fremont: '2600:3c01::',
  atlanta: '2600:3c02::',
  newark: '2600:3c03::',
  london: '2a01:7e00::',
  tokyo: '2400:8900::',
  singapore: '2400:8901::',
  frankfort: '2a01:7e01::',
};
export const ipv6nsSuffix = ['5', '6', '7', '8', '9', 'b', 'c'];

function ipList(ips) {
  const list = [];

  ips.forEach(
    ip => list.push(<li key={ip}>{ip}</li>)
  );

  return list;
}

function nameserversList(isIPv4, linode) {
  const dc = linode.datacenter.datacenter;
  const nameservers = (
    <div className="row">
      <div className="col-sm-4 linode-label-col left">
        Nameservers
      </div>
      <div className="col-sm-8 linode-content-col right">
        <ul className="list-unstyled">
          {
            isIPv4 ?
            ipList(ipv4ns[dc]) :
            ipList(ipv6nsSuffix.map(
              suffix => ipv6ns[dc] + suffix
            ))
          }
        </ul>
      </div>
    </div>
  );

  return nameservers;
}

export class LinodeNetworking extends Component {

  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
  }

  render() {
    /* To Do
     * Global Pool - IPv6
     * members.linode.com
     */
    const linode = this.getLinode();
    const ipv4 = linode.ip_addresses['public'].ipv4;
    const ipv4Public = (
      <div className="col-sm-6 left">
        <div className="row">
          <div className="col-sm-12 left">
            IPv4
            <HelpButton
              to="https://www.linode.com/docs/networking/linux-static-ip-configuration"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 linode-label-col left">
            Inet
          </div>
          <div className="col-sm-8 linode-content-col right">
            <ul className="list-unstyled">
              {ipList(ipv4.map(
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
        {nameserversList(true, linode)}
      </div>
    );

    const linkLocal = linode.ip_addresses['private'].link_local;
    const ipv6Public = (
      <div className="col-sm-6 right">
        <div className="row">
          <div className="col-sm-12 left">
            IPv6
            <HelpButton
              to="https://www.linode.com/docs/networking/native-ipv6-networking"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 linode-label-col left">
            Inet
          </div>
          <div className="col-sm-8 linode-content-col right">
            {linode.ip_addresses['public'].ipv6} / 64
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
        {nameserversList(false, linode)}
      </div>
    );

    const ipPrivate = linode.ip_addresses['private'].ipv4;
    return (
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-sm-6 left">
              <h2>Public network</h2>
            </div>
            <div className="col-sm-6 right">
              <div className="input-group-btn">
                <button type="button" id="glish-button" className="btn btn-default pull-right">
                  Add IP address
                </button>
              </div>
            </div>
          </div>
          <div className="row network-content">
              {ipv4Public}
              {ipv6Public}
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
                <button type="button" id="glish-button" className="btn btn-default pull-right">
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
                    {ipList(ipPrivate.map(
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
