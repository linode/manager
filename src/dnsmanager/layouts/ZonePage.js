import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { showModal, hideModal } from '~/actions/modal';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import { formatDNSSeconds, ONE_DAY } from '../components/SelectDNSSeconds';
import EditSOARecord from '../components/EditSOARecord';
import EditNSRecord from '../components/EditNSRecord';
import EditMXRecord from '../components/EditMXRecord';
import EditARecord from '../components/EditARecord';
import EditTXTRecord from '../components/EditTXTRecord';
import EditSRVRecord from '../components/EditSRVRecord';
import EditCNAMERecord from '../components/EditCNAMERecord';
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
          <Button
            onClick={() => this.renderDeleteRecord('Delete NS Record', record.id)}
            className="btn-secondary"
          >Delete</Button>
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

  formatTXTRecords() {
    const { currentDNSZone } = this.state;

    const { TXT } = currentDNSZone._groupedRecords;
    return (TXT || []).map(record => ({
      ...record,
      name: record.name || currentDNSZone.dnszone,
    }));
  }

  formatCNAMERecords() {
    const { currentDNSZone } = this.state;

    const { CNAME } = currentDNSZone._groupedRecords;
    return (CNAME || []).map(record => ({
      ...record,
      name: record.name || currentDNSZone.dnszone,
    }));
  }

  renderRecords = ({ title, singularTitle, id, records, labels, keys, nav, navOnClick }) => {
    let cardContents = <p>No records created.</p>;
    const editSingularTitle = `Edit ${singularTitle}`;
    if (records && records.length) {
      cardContents = (
        <SecondaryTable
          labels={labels}
          keys={keys}
          rows={records}
          onRowClick={(e, record) => {
            const classList = e.target.classList;
            if (classList.contains('edit-button')) {
              if (records[0].type === 'MX') {
                this.renderEditRecord(editSingularTitle, EditMXRecord, { id });
              } else if (records[0].type === 'NS') {
                this.renderEditRecord(editSingularTitle, EditNSRecord, { id });
              } else if (records[0].type === 'TXT') {
                this.renderEditRecord(editSingularTitle, EditTXTRecord, { id });
              } else if (records[0].type === 'A') {
                this.renderEditRecord(editSingularTitle, EditARecord, { id });
              } else if (records[0].type === 'CNAME') {
                this.renderEditRecord(editSingularTitle, EditCNAMERecord, { id });
              } else if (records[0].type === 'SRV') {
                this.renderEditRecord(editSingularTitle, EditSRVRecord, { id });
              }
            } else if (classList.contains('delete-button')) {
              this.renderDeleteRecord(`Delete ${singularTitle}`, record.id);
            }
          }}
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

  renderDeleteRecord(title, id) {
    const { dispatch } = this.props;
    const { currentDNSZone: zone } = this.state;
    dispatch(showModal(title,
      <ConfirmModalBody
        buttonText="Delete zone record"
        onOk={async () => {
          await dispatch(dnszones.records.delete(zone.id, id));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        Are you sure you want to delete the zone record?
      </ConfirmModalBody>
    ));
  }

  renderEditRecord(title, component, props = {}) {
    const { dispatch } = this.props;
    const { currentDNSZone: zone } = this.state;
    dispatch(showModal(
      title,
      React.createElement(component, {
        ...props,
        dispatch,
        zone,
        close: () => dispatch(hideModal()),
      })
    ));
  }

  renderEditSOARecord(title) {
    return () => { this.renderEditRecord(title, EditSOARecord); };
  }

  renderEditMXRecord(title, id) {
    return () => { this.renderEditRecord(title, EditMXRecord, { id }); };
  }

  renderEditNSRecord(title, id) {
    return () => { this.renderEditRecord(title, EditNSRecord, { id }); };
  }

  renderEditARecord(title, id) {
    return () => { this.renderEditRecord(title, EditARecord, { id }); };
  }

  renderEditTXTRecord(title, id) {
    return () => { this.renderEditRecord(title, EditTXTRecord, { id }); };
  }

  renderEditSRVRecord(title, id) {
    return () => { this.renderEditRecord(title, EditSRVRecord, { id }); };
  }

  renderEditCNAMERecord(title, id) {
    return () => { this.renderEditRecord(title, EditCNAMERecord, { id }); };
  }

  render() {
    const { currentDNSZone } = this.state;

    const formatSeconds = (records) => records.map(record => {
      const { ttl_sec: ttlSec } = record;
      const { ttl_sec: defaultTTLSec } = currentDNSZone;
      return {
        ...record,
        ttl_sec: formatDNSSeconds(ttlSec, defaultTTLSec),
      };
    });

    const addNav = (records = []) => (
      records.map((record) => ({
        ...record,
        nav: (
          <div>
            <Button className="btn-secondary edit-button">Edit</Button>
            <Button className="btn-secondary delete-button">Delete</Button>
          </div>
        ) })
      )
    );

    const nsRecords = formatSeconds(this.formatNSRecords());
    const mxRecords = formatSeconds(addNav(this.formatMXRecords()));
    const aRecords = formatSeconds(addNav(this.formatARecords()));
    const cnameRecords = formatSeconds(addNav(this.formatCNAMERecords()));
    const txtRecords = formatSeconds(addNav(this.formatTXTRecords()));
    const srvRecords = formatSeconds(addNav(this.formatSRVRecords()));

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
            singularTitle="SOA Record"
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
            singularTitle="NS Record"
            id="ns"
            records={nsRecords}
            navOnClick={this.renderEditNSRecord('Add NS Record')}
            labels={['Name Server', 'Subdomain', 'TTL', '']}
            keys={['target', 'name', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="MX Records"
            singularTitle="MX Record"
            id="mx"
            records={mxRecords}
            navOnClick={this.renderEditMXRecord('Add MX Record')}
            labels={['Mail Server', 'Preference', 'Subdomain', '']}
            keys={['target', 'priority', 'name', 'nav']}
          />
          <this.renderRecords
            title="A/AAAA Records"
            singularTitle="A/AAAA Record"
            id="a"
            records={aRecords}
            navOnClick={this.renderEditARecord('Add A/AAAA Record')}
            labels={['Hostname', 'IP Address', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="CNAME Records"
            singularTitle="CNAME Record"
            id="cname"
            navOnClick={this.renderEditCNAMERecord('Add CNAME Record')}
            records={cnameRecords}
            labels={['Hostname', 'Aliases to', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="TXT Records"
            singularTitle="TXT Record"
            id="txt"
            records={txtRecords}
            navOnClick={this.renderEditTXTRecord('Add TXT Record')}
            labels={['Name', 'Value', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="SRV Records"
            id="srv"
            records={srvRecords}
            navOnClick={this.renderEditSRVRecord('Add SRV Record')}
            labels={['Service', 'Priority', 'Domain', 'Weight', 'Port', 'Target', 'TTL', '']}
            keys={['service', 'priority', 'domain', 'weight', 'port', 'target', 'ttl_sec', 'nav']}
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
