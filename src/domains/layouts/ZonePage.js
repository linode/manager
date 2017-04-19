import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { replace } from 'react-router-redux';
import _ from 'lodash';

import { showModal, hideModal } from '~/actions/modal';
import { DeleteModalBody } from 'linode-components/modals';
import { formatDNSSeconds, ONE_DAY } from '../components/SelectDNSSeconds';
import EditSOARecord from '../components/EditSOARecord';
import EditNSRecord from '../components/EditNSRecord';
import EditMXRecord from '../components/EditMXRecord';
import EditARecord from '../components/EditARecord';
import EditTXTRecord from '../components/EditTXTRecord';
import EditSRVRecord from '../components/EditSRVRecord';
import EditCNAMERecord from '../components/EditCNAMERecord';
import { setError } from '~/actions/errors';
import { domains } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { ButtonCell } from 'linode-components/tables/cells';
import { NameserversCell } from '~/components/tables/cells';
import { NAME_SERVERS } from '~/constants';

export class ZonePage extends Component {
  static async preload({ dispatch, getState }, { domainLabel }) {
    try {
      const { id } = await dispatch(getObjectByLabelLazily('domains', domainLabel, 'domain'));
      await dispatch(domains.records.all([id]));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setError(e));
    }
  }

  async componentDidMount() {
    const { dispatch, domain } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle(domain.domain));
  }

  formatNSRecords() {
    const { domain } = this.props;
    const nsRecords = NAME_SERVERS.map(ns => ({
      target: ns,
      ttl_sec: ONE_DAY,
      name: domain.domain,
    }));

    const { NS } = domain._groupedRecords;
    (NS || []).forEach(record => {
      nsRecords.push({
        ...record,
        name: record.name || domain.domain,
      });
    });

    return nsRecords;
  }

  formatMXRecords() {
    const { domain } = this.props;

    const { MX } = domain._groupedRecords;
    return (MX || []).map(record => ({
      ...record,
      name: record.name || domain.domain,
    }));
  }

  formatARecords() {
    const { domain } = this.props;

    const { A, AAAA } = domain._groupedRecords;
    return (A || []).concat(AAAA || []).filter(a => a !== undefined);
  }

  formatSRVRecords() {
    const { domain } = this.props;

    const { SRV } = domain._groupedRecords;
    return (SRV || []).map(record => ({
      ...record, domain: domain.domain,
    }));
  }

  formatTXTRecords() {
    const { domain } = this.props;

    const { TXT } = domain._groupedRecords;
    return (TXT || []).map(record => ({
      ...record,
      name: record.name || domain.domain,
    }));
  }

  formatCNAMERecords() {
    const { domain } = this.props;

    const { CNAME } = domain._groupedRecords;
    return (CNAME || []).map(record => ({
      ...record,
      name: record.name || domain.domain,
    }));
  }

  renderDeleteRecord(title, id) {
    const { dispatch, domain } = this.props;

    dispatch(showModal(title,
      <DeleteModalBody
        buttonText="Delete Domain record"
        onOk={async () => {
          await dispatch(domains.records.delete(domain.id, id));
          dispatch(hideModal());
        }}
        items={[domain.domain]}
        typeOfItem="Domains"
        onCancel={() => dispatch(hideModal())}
      />
    ));
  }

  renderSOAEditRecord() {
    const { dispatch, domain } = this.props;

    dispatch(showModal(
      'Edit SOA Record',
      <EditSOARecord
        dispatch={dispatch}
        zone={domain}
        close={(newDomain) => () => {
          dispatch(hideModal());
          dispatch(replace(`/domains/${newDomain || domain.domain}`));
        }}
      />
    ));
  }

  renderEditRecord(title, component, props = {}) {
    const { dispatch, domain } = this.props;
    dispatch(showModal(
      title,
      React.createElement(component, {
        ...props,
        dispatch,
        zone: domain,
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
    const { domain } = this.props;

    if (!domain) {
      return null;
    }

    const formatSeconds = (records) => {
      return records.map(record => {
        const { ttl_sec: ttlSec } = record;
        const { ttl_sec: defaultTTLSec } = domain;
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
      ...domain,
      ttl_sec: formatDNSSeconds(domain.ttl_sec),
      refresh_sec: formatDNSSeconds(domain.refresh_sec),
      retry_sec: formatDNSSeconds(domain.retry_sec),
      expire_sec: formatDNSSeconds(domain.expire_sec, 604800),
    };

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <Link to="/domains">Domains</Link>
            <h1 title={domain.id}>
              {domain.display_group ? `${domain.display_group} / ` : ''}
              {domain.domain}
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
                { dataKey: 'domain', label: 'Primary Domain' },
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
  domain: PropTypes.object.isRequired,
};

function select(state, ownProps) {
  const { domains } = state.api;
  const { params } = ownProps;
  let domain = Object.values(domains.domains).filter(
    d => d.domain === params.domainLabel)[0];

  if (domain) {
    domain = {
      ...domain,
      _groupedRecords: _.groupBy(domain._records.records, 'type'),
    };
  }
  return { domain };
}

export default connect(select)(ZonePage);
