import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { dnszones } from '~/api';

export class DNSZonePage extends Component {
  async componentWillMount() {
    await this.loadDNSZone();
  }

  getDNSZone() {
    const { dnszoneId } = this.props.params;
    // Return empty object so render function doesn't blow up before loading the zone.
    return this.props.dnszones[parseInt(dnszoneId)] || {};
  }

  async loadDNSZone() {
    const { dispatch } = this.props;
    if (this.getDNSZone()) return;

    try {
      await dispatch(dnszones.one(this.props.params.dnszoneId));
    } catch (e) {
      // TODO: Error handling
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  render() {
    const { dnszone, soa_email: soaEmail, ttl_sec: ttlSec, refresh_sec: refreshSec,
            retry_sec: retrySec, expire_sec: expireSec } = this.getDNSZone();

    return (
      <div>
        <header className="main-header">
          <div className="container">
            <h1>{dnszone}</h1>
          </div>
        </header>
        <div className="main-header-fix no-tabs"></div>
        <div className="container">
          <section className="card">
            <header>
              <h2>SOA record</h2>
            </header>
            <table>
              <thead>
                <tr>
                  <th>Primary DNS</th>
                  <th>Email</th>
                  <th>Default TTL</th>
                  <th>Refresh rate</th>
                  <th>Retry rate</th>
                  <th>Expire time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ns1.linode.com</td>
                  <td>{soaEmail}</td>
                  <td>{ttlSec === 0 ? 'default' : ttlSec}</td>
                  <td>{refreshSec === 0 ? 'default' : refreshSec}</td>
                  <td>{retrySec === 0 ? 'default' : retrySec}</td>
                  <td>{expireSec === 0 ? 'default' : expireSec}</td>
                </tr>
              </tbody>
            </table>
          </section>
          <section className="card">
            <header>
              <h2>NS records</h2>
            </header>
          </section>
          <section className="card">
            <header>
              <h2>MX records</h2>
            </header>
          </section>
          <section className="card">
            <header>
              <h2>A/AAAA records</h2>
            </header>
          </section>
          <section className="card">
            <header>
              <h2>CNAME records</h2>
            </header>
          </section>
          <section className="card">
            <header>
              <h2>TXT records</h2>
            </header>
          </section>
          <section className="card">
            <header>
              <h2>SRV records</h2>
            </header>
          </section>
        </div>
      </div>
    );
  }
}

DNSZonePage.propTypes = {
  params: PropTypes.shape({
    dnszoneId: PropTypes.string.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  dnszones: PropTypes.object.isRequired,
};

function select(state) {
  return {
    dnszones: state.api.dnszones.dnszones,
  };
}

export default connect(select)(DNSZonePage);
