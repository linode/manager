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
    const { dispatch, dnszone } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle(dnszone.dnszone));
  }

  formatNSRecords() {
    const { dnszone } = this.props;
    const nsRecords = NAME_SERVERS.map(ns => ({
      target: ns,
      ttl_sec: ONE_DAY,
      name: dnszone.dnszone,
    }));

    const { NS } = dnszone._groupedRecords;
    (NS || []).forEach(record => {
      nsRecords.push({
        ...record,
        name: record.name || dnszone.dnszone,
      });
    });

    return nsRecords;
  }

  formatMXRecords() {
    const { dnszone } = this.props;

    const { MX } = dnszone._groupedRecords;
    return (MX || []).map(record => ({
      ...record,
      name: record.name || dnszone.dnszone,
    }));
  }

  formatARecords() {
    const { dnszone } = this.props;

    const { A, AAAA } = dnszone._groupedRecords;
    return (A || []).concat(AAAA || []).filter(a => a !== undefined);
  }

  formatSRVRecords() {
    const { dnszone } = this.props;

    const { SRV } = dnszone._groupedRecords;
    return (SRV || []).map(record => ({
      ...record, domain: dnszone.dnszone,
    }));
  }

  formatTXTRecords() {
    const { dnszone } = this.props;

    const { TXT } = dnszone._groupedRecords;
    return (TXT || []).map(record => ({
      ...record,
      name: record.name || dnszone.dnszone,
    }));
  }

  formatCNAMERecords() {
    const { dnszone } = this.props;

    const { CNAME } = dnszone._groupedRecords;
    return (CNAME || []).map(record => ({
      ...record,
      name: record.name || dnszone.dnszone,
    }));
  }

  renderDeleteRecord(title, id) {
    const { dispatch, dnszone } = this.props;

    dispatch(showModal(title,
      <ConfirmModalBody
        buttonText="Delete Domain record"
        onOk={async () => {
          await dispatch(dnszones.records.delete(dnszone.id, id));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        Are you sure you want to delete the Domain record?
      </ConfirmModalBody>
    ));
  }

  renderSOAEditRecord() {
    const { dispatch, dnszone } = this.props;

    dispatch(showModal(
      'Edit SOA Record',
      <EditSOARecord
        dispatch={dispatch}
        zone={dnszone}
        close={(zone) => {
          dispatch(hideModal());
          dispatch(replace(`/domains/${zone}`));
        }}
      />
    ));
  }

  renderEditRecord(title, component, props = {}) {
    const { dispatch, dnszone } = this.props;

    dispatch(showModal(
      title,
      <component
        {...props}
        dispatch={dispatch}
        zone={dnszone}
        close={() => dispatch(hideModal())}
      />
    ));
  }

  render() {
    const { dnszone } = this.props;

    if (!dnszone) {
      return null;
    }

    const formatSeconds = (records) => {
      return records.map(record => {
        const { ttl_sec: ttlSec } = record;
        const { ttl_sec: defaultTTLSec } = dnszone;
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
      ...dnszone,
      ttl_sec: formatDNSSeconds(dnszone.ttl_sec),
      refresh_sec: formatDNSSeconds(dnszone.refresh_sec),
      retry_sec: formatDNSSeconds(dnszone.retry_sec),
      expire_sec: formatDNSSeconds(dnszone.expire_sec, 604800),
    };

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <Link to="/domains">Domains</Link>
            <h1 title={dnszone.id}>
              {dnszone.display_group ? `${dnszone.display_group} / ` : ''}
              {dnszone.dnszone}
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
                  onEditClick: () => {},
                  onDeleteClick: () => {},
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
                { cellComponent: ButtonCell, text: 'Edit', onClick: () => {} },
                { cellComponent: ButtonCell, text: 'Delete', onClick: () => {} },
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
                { cellComponent: ButtonCell, text: 'Edit', onClick: () => {} },
                { cellComponent: ButtonCell, text: 'Delete', onClick: () => {} },
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
                { cellComponent: ButtonCell, text: 'Edit', onClick: () => {} },
                { cellComponent: ButtonCell, text: 'Delete', onClick: () => {} },
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
                { cellComponent: ButtonCell, text: 'Edit', onClick: () => {} },
                { cellComponent: ButtonCell, text: 'Delete', onClick: () => {} },
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
                { cellComponent: ButtonCell, text: 'Edit', onClick: () => {} },
                { cellComponent: ButtonCell, text: 'Delete', onClick: () => {} },
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
  dnszone: PropTypes.object,
};

function select(state, ownProps) {
  const { dnszones } = state.api;
  const { params } = ownProps;
  let dnszone = Object.values(dnszones.dnszones).filter(
    d => d.dnszone === params.dnszoneLabel)[0];

  if (dnszone) {
    dnszone = {
      ...dnszone,
      _groupedRecords: _.groupBy(dnszone._records.records, 'type'),
    };
  }
  return { dnszone };
}

export default connect(select)(ZonePage);
