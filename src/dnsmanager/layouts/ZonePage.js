import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { setError } from '~/actions/errors';
import { dnszones } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { Button } from '~/components/buttons';
import Card from '~/components/Card';
import SecondaryTable from '~/components/SecondaryTable';
import { NAME_SERVERS } from '~/constants';

export class ZonePage extends Component {
  static async preload({ dispatch, getState }, { dnszoneLabel }) {
    try {
      const { id } = await dispatch(getObjectByLabelLazily('dnszones', dnszoneLabel, 'dnszone'));
      await dispatch(dnszones.records.all([id]));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setError(e));
    }
  }

  constructor(props) {
    super(props);

    const currentDNSZone = Object.values(props.dnszones.dnszones).filter(
      d => d.dnszone === props.params.dnszoneLabel)[0];
    this.state = {
      currentDNSZone: {
        ...currentDNSZone,
        _groupedRecords: _.groupBy(currentDNSZone._records.records, 'type'),
      },
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('DNS Manager'));
  }

  formatNSRecords() {
    const { currentDNSZone } = this.state;
    const nsRecords = NAME_SERVERS.map(ns => ({
      target: ns,
      name: currentDNSZone.dnszone,
    }));

    currentDNSZone._groupedRecords.NS.forEach(record => {
      nsRecords.push({
        ...record,
        name: record.name || currentDNSZone.dnszone,
      });
    });

    return nsRecords.map((record, i) => ({
      ...record,
      nav: <Button disabled={i < NAME_SERVERS.length}>Delete</Button>,
    }));
  }

  formatMXRecords() {
    const { currentDNSZone } = this.state;

    return currentDNSZone._groupedRecords.MX.map(record => ({
      ...record,
      name: record.name || currentDNSZone.dnszone,
    }));
  }

  formatARecords() {
    const { currentDNSZone } = this.state;

    return currentDNSZone._groupedRecords.A.concat(
      currentDNSZone._groupedRecords.AAAA).filter(a => a !== undefined);
  }

  formatSRVRecords() {
    const { currentDNSZone } = this.state;

    return currentDNSZone._groupedRecords.SRV.map(record => ({
      ...record, domain: currentDNSZone.dnszone,
    }));
  }

  renderRecords = ({ title, id, rows, labels, keys, noNav = false }) => {
    let cardContents = <p>No records created.</p>;
    if (rows && rows.length) {
      cardContents = (
        <SecondaryTable
          labels={labels}
          keys={keys}
          rows={rows}
        />
      );
    }

    return (
      <Card
        title={title}
        id={id}
        nav={noNav ? null : <Button>Add Record</Button>}
      >
        {cardContents}
      </Card>
    );
  }

  render() {
    const { currentDNSZone } = this.state;
    const { CNAME: _cnameRecords, TXT: _txtRecords } = currentDNSZone._groupedRecords;

    const setDefaultTTL = (records) => records.map(record => {
      const { ttl_sec: ttlSec } = record;
      const { ttl_sec: defaultTTLSec } = currentDNSZone;
      return {
        ...records,
        ttl_sec: (!ttlSec || ttlSec === defaultTTLSec) ? 'Default' : ttlSec,
      };
    });
    const addNav = (records) => records.map(record => ({
      ...record, nav: <Button>Delete</Button>,
    }));

    const nsRecords = setDefaultTTL(this.formatNSRecords());
    const mxRecords = setDefaultTTL(addNav(this.formatMXRecords()));
    const aRecords = setDefaultTTL(addNav(this.formatARecords()));
    const cnameRecords = setDefaultTTL(addNav(_cnameRecords));
    const txtRecords = setDefaultTTL(addNav(_txtRecords));
    const srvRecords = setDefaultTTL(addNav(this.formatSRVRecords()));
    const soaRecord = {
      ...currentDNSZone,
      ttl_sec: currentDNSZone.ttl_sec || 'Default',
      refresh_sec: currentDNSZone.refresh_sec || 'Default',
      retry_sec: currentDNSZone.retry_sec || 'Default',
      expire_sec: currentDNSZone.expire_sec || 'Default',
    };

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <h1>{currentDNSZone.dnszone}</h1>
          </div>
        </header>
        <div className="container">
          <this.renderRecords
            title="SOA Record"
            id="soa"
            rows={[soaRecord]}
            labels={['Primary DNS', 'Email', 'Default TTL', 'Refresh Rate', 'Retry Rate',
                     'Expire Time', '']}
            keys={['dnszone', 'soa_email', 'ttl_sec', 'refresh_sec', 'retry_sec', 'expire_sec',
                   'nav']}
            noNav
          />
          <this.renderRecords
            title="NS Records"
            id="ns"
            rows={nsRecords}
            labels={['Name Server', 'Subdomain', 'TTL', '']}
            keys={['target', 'name', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="MX Records"
            id="mx"
            rows={mxRecords}
            labels={['Mail Server', 'Preference', 'Subdomain', '']}
            keys={['target', 'priority', 'name', 'nav']}
          />
          <this.renderRecords
            title="A/AAAA Records"
            id="a"
            rows={aRecords}
            labels={['Hostname', 'IP Address', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="CNAME Records"
            id="cname"
            rows={cnameRecords}
            labels={['Hostname', 'Aliases to', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="TXT Records"
            id="txt"
            rows={txtRecords}
            labels={['Name', 'Value', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="SRV Records"
            id="srv"
            rows={srvRecords}
            labels={['Service', 'Priority', 'Domain', 'Weight', 'Port', 'Target', 'TTL', '']}
            keys={['name', 'priority', 'domain', 'weight', 'port', 'target', 'ttl_sec', 'nav']}
          />
        </div>
      </div>
    );
  }
}

ZonePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  dnszones: PropTypes.object.isRequired,
  params: PropTypes.shape({
    dnszoneLabel: PropTypes.string.isRequired,
  }),
};

function select(state) {
  return {
    dnszones: state.api.dnszones,
  };
}

export default connect(select)(ZonePage);
