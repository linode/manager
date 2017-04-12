import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { replace } from 'react-router-redux';
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
import { Card, CardHeader } from '~/components/cards';
import { Table } from '~/components/tables';
import {
  ButtonCell,
  NameserversCell,
} from '~/components/tables/cells';
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

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('DNS Manager'));
  }

  formatNSRecords() {
    const { currentDNSZone } = this.props;
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

    return nsRecords;
  }

  formatMXRecords() {
    const { currentDNSZone } = this.props;

    const { MX } = currentDNSZone._groupedRecords;
    return (MX || []).map(record => ({
      ...record,
      name: record.name || currentDNSZone.dnszone,
    }));
  }

  formatARecords() {
    const { currentDNSZone } = this.props;

    const { A, AAAA } = currentDNSZone._groupedRecords;
    return (A || []).concat(AAAA || []).filter(a => a !== undefined);
  }

  formatSRVRecords() {
    const { currentDNSZone } = this.props;

    const { SRV } = currentDNSZone._groupedRecords;
    return (SRV || []).map(record => ({
      ...record, domain: currentDNSZone.dnszone,
    }));
  }

  formatTXTRecords() {
    const { currentDNSZone } = this.props;

    const { TXT } = currentDNSZone._groupedRecords;
    return (TXT || []).map(record => ({
      ...record,
      name: record.name || currentDNSZone.dnszone,
    }));
  }

  formatCNAMERecords() {
    const { currentDNSZone } = this.props;

    const { CNAME } = currentDNSZone._groupedRecords;
    return (CNAME || []).map(record => ({
      ...record,
      name: record.name || currentDNSZone.dnszone,
    }));
  }

  renderDeleteRecord(title, id) {
    const { dispatch, currentDNSZone } = this.props;

    dispatch(showModal(title,
      <ConfirmModalBody
        buttonText="Delete zone record"
        onOk={async () => {
          await dispatch(dnszones.records.delete(currentDNSZone.id, id));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        Are you sure you want to delete the zone record?
      </ConfirmModalBody>
    ));
  }

  renderSOAEditRecord() {
    const { dispatch, currentDNSZone } = this.props;

    dispatch(showModal(
      'Edit SOA Record',
      <EditSOARecord
        dispatch={dispatch}
        zone={currentDNSZone}
        close={(zone) => {
          dispatch(hideModal());
          dispatch(replace(`/dnsmanager/${zone}`));
        }}
      />
    ));
  }

  renderEditRecord(title, component, props = {}) {
    const { dispatch, currentDNSZone: zone } = this.props;

    dispatch(showModal(
      title,
      React.createElement(component, {
        ...props,
        dispatch,
        zone,
        close: () => dispatch(hideModal()),
      }),
    ));
  }

  renderEditSOARecord(title) {
    return this.renderEditRecord(title, EditSOARecord);
  }

  renderEditMXRecord(title, id) {
    return this.renderEditRecord(title, EditMXRecord, { id });
  }

  renderEditNSRecord(title, id) {
    return this.renderEditRecord(title, EditNSRecord, { id });
  }

  renderEditARecord(title, id) {
    return this.renderEditRecord(title, EditARecord, { id });
  }

  renderEditTXTRecord(title, id) {
    return this.renderEditRecord(title, EditTXTRecord, { id });
  }

  renderEditSRVRecord(title, id) {
    return this.renderEditRecord(title, EditSRVRecord, { id });
  }

  renderEditCNAMERecord(title, id) {
    return this.renderEditRecord(title, EditCNAMERecord, { id });
  }

  render() {
    const { currentDNSZone } = this.props;

    if (!currentDNSZone) {
      return null;
    }

    const formatSeconds = (records) => {
      return records.map(record => {
        const { ttl_sec: ttlSec } = record;
        const { ttl_sec: defaultTTLSec } = currentDNSZone;
        return {
          ...record,
          ttl_sec: formatDNSSeconds(ttlSec, defaultTTLSec),
        };
      });
    };

    const nsRecords = formatSeconds(this.formatNSRecords());
    const mxRecords = formatSeconds(this.formatMXRecords());
    const aRecords = formatSeconds(this.formatARecords());
    const cnameRecords = formatSeconds(this.formatCNAMERecords());
    const txtRecords = formatSeconds(this.formatTXTRecords());
    const srvRecords = formatSeconds(this.formatSRVRecords());

    const soaRecord = {
      ...currentDNSZone,
      ttl_sec: formatDNSSeconds(currentDNSZone.ttl_sec),
      refresh_sec: formatDNSSeconds(currentDNSZone.refresh_sec),
      retry_sec: formatDNSSeconds(currentDNSZone.retry_sec),
      expire_sec: formatDNSSeconds(currentDNSZone.expire_sec, 604800),
    };

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <Link to="/dnsmanager">DNS Manager</Link>
            <h1 title={currentDNSZone.id}>
              {currentDNSZone.display_group ? `${currentDNSZone.display_group} / ` : ''}
              {currentDNSZone.dnszone}
            </h1>
          </div>
        </header>
        <div className="container">
          <Card
            id="soa"
            header={
              <CardHeader title="SOA Record" />
            }
          >
            <Table
              className="Table--secondary"
              columns={[
                { dataKey: 'dnszone', label: 'Primary DNS' },
                { dataKey: 'soa_email', label: 'Email' },
                { dataKey: 'ttl_sec', label: 'Default TTL' },
                { dataKey: 'refresh_sec', label: 'Refresh Rate' },
                { dataKey: 'retry_sec', label: 'Retry Rate' },
                { dataKey: 'expire_sec', label: 'Expire Time' },
                {
                  cellComponent: ButtonCell,
                  text: 'Edit',
                  onClick: () => {
                    this.renderSOAEditRecord();
                  },
                },
              ]}
              data={[soaRecord]}
            />
          </Card>
          <Card
            id="ns"
            header={
              <CardHeader
                title="NS Records"
                nav={
                  <Button
                    onClick={() => {
                      this.renderEditRecord('Add NS Record', EditNSRecord);
                    }}
                  >
                    Add NS Record
                  </Button>
                }
              />
            }
          >
            <Table
              className="Table--secondary"
              columns={[
                { dataKey: 'target', label: 'Name Server' },
                { dataKey: 'name', label: 'Subdomain' },
                { dataKey: 'ttl_sec', label: 'TTL' },
                {
                  cellComponent: NameserversCell,
                  onEditClick: ({ id }) => this.renderEditNSRecord('Edit NS Record', id),
                  onDeleteClick: ({ id }) => this.renderDeleteRecord('Delete NS Record', id),
                },
              ]}
              data={nsRecords}
            />
          </Card>
          <Card
            id="mx"
            header={
              <CardHeader
                title="MX Records"
                nav={
                  <Button
                    onClick={() => { this.renderEditRecord('Add MX Record', EditMXRecord); }}
                  >
                    Add MX Record
                  </Button>
                }
              />
            }
          >
            <Table
              className="Table--secondary"
              columns={[
                { dataKey: 'target', label: 'Mail Server' },
                { dataKey: 'priority', label: 'Preference' },
                { dataKey: 'name', label: 'Subdomain' },
                {
                  cellComponent: ButtonCell,
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditMXRecord('Edit MX Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  text: 'Delete',
                  onClick: ({ id }) => this.renderDeleteRecord('Delete MX Record', id),
                },
              ]}
              data={mxRecords}
            />
          </Card>
          <Card
            id="a"
            header={
              <CardHeader
                title="A/AAAA Records"
                nav={
                  <Button
                    onClick={() => { this.renderEditRecord('Add A/AAAA Record', EditARecord); }}
                  >
                    Add A/AAAA Record
                  </Button>
                }
              />
            }
          >
            <Table
              className="Table--secondary"
              columns={[
                { dataKey: 'name', label: 'Hostname' },
                { dataKey: 'target', label: 'IP Address' },
                { dataKey: 'ttl_sec', label: 'TTL' },
                {
                  cellComponent: ButtonCell,
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditARecord('Edit A/AAAA Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  text: 'Delete',
                  onClick: ({ id }) => this.renderDeleteRecord('Delete A/AAAA Record', id),
                },
              ]}
              data={aRecords}
            />
          </Card>
          <Card
            id="cname"
            header={
              <CardHeader
                title="CNAME Records"
                nav={
                  <Button
                    onClick={() => {
                      this.renderEditRecord('Add CNAME Record', EditCNAMERecord);
                    }}
                  >
                    Add CNAME Record
                  </Button>
                }
              />
            }
          >
            <Table
              className="Table--secondary"
              columns={[
                { dataKey: 'name', label: 'Hostname' },
                { dataKey: 'target', label: 'Aliases to' },
                { dataKey: 'ttl_sec', label: 'TTL' },
                {
                  cellComponent: ButtonCell,
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditCNAMERecord('Edit CNAME Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  text: 'Delete',
                  onClick: ({ id }) => this.renderDeleteRecord('Delete CNAME Record', id),
                },
              ]}
              data={cnameRecords}
            />
          </Card>
          <Card
            id="txt"
            header={
              <CardHeader
                title="TXT Records"
                nav={
                  <Button
                    onClick={() => { this.renderEditRecord('Add TXT Record', EditTXTRecord); }}
                  >
                    Add TXT Record
                  </Button>
                }
              />
            }
          >
            <Table
              className="Table--secondary"
              columns={[
                { dataKey: 'name', label: 'Name' },
                { dataKey: 'target', label: 'Value' },
                { dataKey: 'ttl_sec', label: 'TTL' },
                {
                  cellComponent: ButtonCell,
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditTXTRecord('Edit TXT Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  text: 'Delete',
                  onClick: ({ id }) => this.renderDeleteRecord('Delete TXT Record', id),
                },
              ]}
              data={txtRecords}
            />
          </Card>
          <Card
            id="srv"
            header={
              <CardHeader
                title="SRV Records"
                nav={
                  <Button
                    onClick={() => { this.renderEditRecord('Add SRV Record', EditSRVRecord); }}
                  >
                    Add SRV Record
                  </Button>
                }
              />
            }
          >
            <Table
              className="Table--secondary"
              columns={[
                { dataKey: 'service', label: 'Service' },
                { dataKey: 'priority', label: 'Priority' },
                { dataKey: 'domain', label: 'Domain' },
                { dataKey: 'weight', label: 'Weight' },
                { dataKey: 'port', label: 'Port' },
                { dataKey: 'target', label: 'Target' },
                { dataKey: 'ttl_sec', label: 'TTL' },
                {
                  cellComponent: ButtonCell,
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditSRVRecord('Edit SRV Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  text: 'Delete',
                  onClick: ({ id }) => this.renderDeleteRecord('Delete SRV Record', id),
                },
              ]}
              data={srvRecords}
            />
          </Card>
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
  currentDNSZone: PropTypes.object,
};

function select(state, ownProps) {
  const { dnszones } = state.api;
  const { params } = ownProps;
  let currentDNSZone = Object.values(dnszones.dnszones).filter(
    d => d.dnszone === params.dnszoneLabel)[0];

  if (currentDNSZone) {
    currentDNSZone = {
      ...currentDNSZone,
      _groupedRecords: _.groupBy(currentDNSZone._records.records, 'type'),
    };
  }
  return {
    dnszones: dnszones,
    currentDNSZone: currentDNSZone,
  };
}

export default connect(select)(ZonePage);
