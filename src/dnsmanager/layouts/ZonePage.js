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

    return nsRecords;
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

  render() {
    const { currentDNSZone } = this.state;

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
            <h1 title={currentDNSZone.id}>
              {currentDNSZone.display_group ? `${currentDNSZone.display_group} / ` : ''}
              {currentDNSZone.dnszone}
            </h1>
          </div>
        </header>
        <div className="container">
          <Card id="soa" title="SOA Record">
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
                    this.renderEditRecord('Edit SOA Record', EditSOARecord);
                  },
                },
              ]}
              data={[soaRecord]}
            />
          </Card>
          <Card
            id="ns"
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
            title="MX Records"
            nav={
              <Button
                onClick={() => { this.renderEditRecord('Add MX Record', EditMXRecord); }}
              >
                Add MX Record
              </Button>
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
            title="A/AAAA Records"
            nav={
              <Button
                onClick={() => { this.renderEditRecord('Add A/AAAA Record', EditARecord); }}
              >
                Add A/AAAA Record
              </Button>
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
            title="TXT Records"
            nav={
              <Button
                onClick={() => { this.renderEditRecord('Add TXT Record', EditTXTRecord); }}
              >
                Add TXT Record
              </Button>
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
            title="SRV Records"
            nav={
              <Button
                onClick={() => { this.renderEditRecord('Add SRV Record', EditSRVRecord); }}
              >
                Add SRV Record
              </Button>
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
