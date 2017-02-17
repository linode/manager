import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { showModal, hideModal } from '~/actions/modal';
import { formatDNSSeconds, ONE_DAY } from '../components/SelectDNSSeconds';
import EditSOARecord from '../components/EditSOARecord';
import EditNSRecord from '../components/EditNSRecord';
import EditMXRecord from '../components/EditMXRecord';
import { setError } from '~/actions/errors';
import { dnszones } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { Button } from '~/components/buttons';
import { Card } from '~/components/cards';
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

    const updateCurrentDNSZone = (props) => {
      const currentDNSZone = Object.values(props.dnszones.dnszones).filter(
        d => d.dnszone === props.params.dnszoneLabel)[0];
      this.state = {
        currentDNSZone: {
          ...currentDNSZone,
          _groupedRecords: _.groupBy(currentDNSZone._records.records, 'type'),
        },
      };
    };

    // currentDNSZone needs to be updated now and every time props changes
    this.componentWillReceiveProps = updateCurrentDNSZone;
    updateCurrentDNSZone(props);
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
      ttl_sec: ONE_DAY,
      name: currentDNSZone.dnszone,
    }));

    const { NS } = currentDNSZone._groupedRecords;
    (NS || []).forEach(record => {
      nsRecords.push({
        ...record,
        name: record.name || currentDNSZone.dnszone,
      });
    });

    return nsRecords.map((record, i) => ({
      ...record,
      nav: i < NAME_SERVERS.length ? <small className="text-muted">Read-only</small> : (
        <div>
          <Button
            onClick={this.renderEditNSRecord('Edit NS Record', record.id)}
            className="btn-secondary"
          >Edit</Button>
          <Button className="btn-secondary">Delete</Button>
        </div>
      ),
    }));
  }

  formatMXRecords() {
    const { currentDNSZone } = this.state;

    const { MX } = currentDNSZone._groupedRecords;
    return (MX || []).map(record => ({
      ...record,
      name: record.name || currentDNSZone.dnszone,
    }));
  }

  formatARecords() {
    const { currentDNSZone } = this.state;

    const { A, AAAA } = currentDNSZone._groupedRecords;
    return (A || []).concat(AAAA || []).filter(a => a !== undefined);
  }

  formatSRVRecords() {
    const { currentDNSZone } = this.state;

    const { SRV } = currentDNSZone._groupedRecords;
    return (SRV || []).map(record => ({
      ...record, domain: currentDNSZone.dnszone,
    }));
  }

  renderRecords = ({ title, id, records, labels, keys, nav, navOnClick }) => {
    let cardContents = <p>No records created.</p>;
    if (records && records.length) {
      cardContents = (
        <SecondaryTable
          labels={labels}
          keys={keys}
          rows={records}
        />
      );
    }

    const titleSingular =
      title[title.length - 1] === 's' ? title.substring(0, title.length - 1) : title;

    return (
      <Card
        title={title}
        id={id}
        nav={nav === undefined ? <Button onClick={navOnClick}>Add {titleSingular}</Button> : nav}
      >
        {cardContents}
      </Card>
    );
  }

  renderEditRecord(title, component, props = {}) {
    const { dispatch } = this.props;
    const { currentDNSZone: zone } = this.state;
    return () => dispatch(showModal(
      title,
      React.createElement(component, {
        ...props,
        dispatch,
        zone,
        close: () => dispatch(hideModal()),
      })));
  }

  renderEditSOARecord(title) {
    return this.renderEditRecord(title, EditSOARecord);
  }

  renderEditNSRecord(title, id) {
    return this.renderEditRecord(title, EditNSRecord, { id });
  }

  renderEditMXRecord(title, id) {
    return this.renderEditRecord(title, EditMXRecord, { id });
  }

  render() {
    const { currentDNSZone } = this.state;
    const { CNAME: _cnameRecords, TXT: _txtRecords } = currentDNSZone._groupedRecords;

    const formatSeconds = (records) => records.map(record => {
      const { ttl_sec: ttlSec } = record;
      const { ttl_sec: defaultTTLSec } = currentDNSZone;
      return {
        ...record,
        ttl_sec: formatDNSSeconds(ttlSec, defaultTTLSec),
      };
    });
    const addNav = (records, onEdit, onDelete) => records.map(record => ({
      ...record, nav: (
        <div>
          <Button
            onClick={onEdit && onEdit(record.id)}
            className="btn-secondary"
          >Edit</Button>
          <Button
            onClick={onDelete && onDelete(record.id)}
            className="btn-secondary"
          >Delete</Button>
        </div>
      ),
    }));

    const nsRecords = formatSeconds(
      this.formatNSRecords());
    const mxRecords = formatSeconds(
      addNav(this.formatMXRecords(), (id) => this.renderEditMXRecord('Edit MX Record', id)));
    const aRecords = formatSeconds(
      addNav(this.formatARecords()));
    const cnameRecords = formatSeconds(
      addNav(_cnameRecords || []));
    const txtRecords = formatSeconds(
      addNav(_txtRecords || []));
    const srvRecords = formatSeconds(
      addNav(this.formatSRVRecords()));
    const soaRecord = {
      ...currentDNSZone,
      ttl_sec: formatDNSSeconds(currentDNSZone.ttl_sec),
      refresh_sec: formatDNSSeconds(currentDNSZone.refresh_sec),
      retry_sec: formatDNSSeconds(currentDNSZone.retry_sec),
      expire_sec: formatDNSSeconds(currentDNSZone.expire_sec, 604800),
      nav: (
        <div>
          <Button
            onClick={this.renderEditSOARecord('Edit SOA Record')}
            className="btn-secondary"
          >Edit</Button>
          <Button
            onClick={() => {}}
            className="btn-secondary"
          >Delete</Button>
        </div>
      ),
    };

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <h1 title={currentDNSZone.id}>
              {currentDNSZone.display_group ? `${currentDNSZone.display_group} / ` : ''}
              {currentDNSZone.dnszone}
            </h1>
          </div>
        </header>
        <div className="container">
          <this.renderRecords
            title="SOA Record"
            id="soa"
            records={[soaRecord]}
            labels={['Primary DNS', 'Email', 'Default TTL', 'Refresh Rate', 'Retry Rate',
                     'Expire Time', '']}
            keys={['dnszone', 'soa_email', 'ttl_sec', 'refresh_sec', 'retry_sec', 'expire_sec',
                   'nav']}
            nav={null}
          />
          <this.renderRecords
            title="NS Records"
            id="ns"
            records={nsRecords}
            navOnClick={this.renderEditNSRecord('Add NS Record')}
            labels={['Name Server', 'Subdomain', 'TTL', '']}
            keys={['target', 'name', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="MX Records"
            id="mx"
            records={mxRecords}
            navOnClick={this.renderEditMXRecord('Add MX Record')}
            labels={['Mail Server', 'Preference', 'Subdomain', '']}
            keys={['target', 'priority', 'name', 'nav']}
          />
          <this.renderRecords
            title="A/AAAA Records"
            id="a"
            records={aRecords}
            labels={['Hostname', 'IP Address', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="CNAME Records"
            id="cname"
            records={cnameRecords}
            labels={['Hostname', 'Aliases to', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="TXT Records"
            id="txt"
            records={txtRecords}
            labels={['Name', 'Value', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="SRV Records"
            id="srv"
            records={srvRecords}
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
