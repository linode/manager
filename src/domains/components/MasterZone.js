import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { replace } from 'react-router-redux';

import { DeleteModalBody } from 'linode-components/modals';
import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { ButtonCell, LabelCell } from 'linode-components/tables/cells';

import { showModal, hideModal } from '~/actions/modal';
import { domains } from '~/api';
import { NameserversCell } from '~/components/tables/cells';
import { GroupLabel } from '~/components';
import { NAME_SERVERS } from '~/constants';

import { formatDNSSeconds, ONE_DAY } from './SelectDNSSeconds';
import EditSOARecord from './EditSOARecord';
import EditNSRecord from './EditNSRecord';
import EditMXRecord from './EditMXRecord';
import EditARecord from './EditARecord';
import EditTXTRecord from './EditTXTRecord';
import EditSRVRecord from './EditSRVRecord';
import EditCNAMERecord from './EditCNAMERecord';


export class MasterZone extends Component {
  formatNSRecords() {
    const { domain } = this.props;
    const nsRecords = NAME_SERVERS.map(ns => ({
      target: ns,
      ttl_sec: ONE_DAY,
      name: domain.domain,
      readOnly: true,
    }));

    const { NS } = domain._groupedRecords;
    (NS || []).forEach(record => {
      nsRecords.push({
        ...record,
        name: record.name || domain.domain,
        readOnly: false,
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

  renderDeleteRecord(title, id, name) {
    const { dispatch, domain } = this.props;

    dispatch(showModal(title,
      <DeleteModalBody
        onOk={async () => {
          await dispatch(domains.records.delete(domain.id, id));
          dispatch(hideModal());
        }}
        items={[name]}
        typeOfItem={title}
        onCancel={() => dispatch(hideModal())}
      />
    ));
  }

  renderSOAEditRecord() {
    const { dispatch, domain } = this.props;
    const title = 'Edit SOA Record';
    dispatch(showModal(
      title,
      <EditSOARecord
        dispatch={dispatch}
        title={title}
        domains={domain}
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
        title,
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
              <Link to={`/domains/${domain.domain}`}>
                <GroupLabel object={{ ...domain, label: domain.domain }} />
              </Link>
            </h1>
          </div>
        </header>
        <div className="container">
          <section>
            <Card
              id="soa"
              header={<CardHeader title="SOA Record" />}
            >
              <Table
                className="Table--secondary"
                columns={[
                  {
                    cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'domain',
                    label: 'Primary Domain',
                    titleKey: 'domain',
                    tooltipEnabled: true,
                  },
                  { headerClassName: 'EmailColumn', dataKey: 'soa_email', label: 'Email' },
                  { dataKey: 'ttl_sec', label: 'Default TTL' },
                  { dataKey: 'refresh_sec', label: 'Refresh Rate' },
                  { dataKey: 'retry_sec', label: 'Retry Rate' },
                  { dataKey: 'expire_sec', label: 'Expire Time' },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    text: 'Edit',
                    onClick: () => {
                      this.renderSOAEditRecord();
                    },
                  },
                ]}
                data={[soaRecord]}
              />
            </Card>
          </section>
          <section>
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
                  {
                    cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'name',
                    label: 'Subdomain',
                    titleKey: 'name',
                    tooltipEnabled: true,
                  },
                  { dataKey: 'ttl_sec', label: 'TTL' },
                  {
                    cellComponent: NameserversCell,
                    onEditClick: ({ id }) => this.renderEditNSRecord('Edit NS Record', id),
                    onDeleteClick: ({ id, target }) =>
                      this.renderDeleteRecord('Delete NS Record', id, target),
                  },
                ]}
                data={nsRecords}
                noDataMessage="You have no NS records."
              />
            </Card>
          </section>
          <section>
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
                  {
                    cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'name',
                    label: 'Subdomain',
                    titleKey: 'name',
                    tooltipEnabled: true,
                  },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    text: 'Edit',
                    onClick: ({ id }) => this.renderEditMXRecord('Edit MX Record', id),
                  },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    text: 'Delete',
                    onClick: ({ id, target }) =>
                      this.renderDeleteRecord('Delete MX Record', id, target),
                  },
                ]}
                data={mxRecords}
                noDataMessage="You have no MX records."
              />
            </Card>
          </section>
          <section>
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
                  {
                    cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'name',
                    label: 'Hostname',
                    titleKey: 'name',
                    tooltipEnabled: true,
                  },
                  { headerClassName: 'IPAddressColumn', dataKey: 'target', label: 'IP Address' },
                  { dataKey: 'ttl_sec', label: 'TTL' },
                  {
                    cellComponent: ButtonCell,
                    text: 'Edit',
                    onClick: ({ id }) => this.renderEditARecord('Edit A/AAAA Record', id),
                  },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    text: 'Delete',
                    onClick: ({ id, name }) =>
                      this.renderDeleteRecord('Delete A/AAAA Record', id, name),
                  },
                ]}
                data={aRecords}
                noDataMessage="You have no A/AAAA records."
              />
            </Card>
          </section>
          <section>
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
                  {
                    cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'name',
                    label: 'Hostname',
                    titleKey: 'name',
                    tooltipEnabled: true,
                  },
                  { dataKey: 'target', label: 'Aliases to' },
                  { dataKey: 'ttl_sec', label: 'TTL' },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    text: 'Edit',
                    onClick: ({ id }) => this.renderEditCNAMERecord('Edit CNAME Record', id),
                  },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    text: 'Delete',
                    onClick: ({ id, name }) =>
                      this.renderDeleteRecord('Delete CNAME Record', id, name),
                  },
                ]}
                data={cnameRecords}
                noDataMessage="You have no CNAME records."
              />
            </Card>
          </section>
          <section>
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
                  {
                    cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'name',
                    label: 'Name',
                    titleKey: 'name',
                    tooltipEnabled: true,
                  },
                  { cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'target',
                    label: 'Value',
                    tooltipEnabled: true,
                  },
                  { dataKey: 'ttl_sec', label: 'TTL' },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    text: 'Edit',
                    onClick: ({ id }) => this.renderEditTXTRecord('Edit TXT Record', id),
                  },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    text: 'Delete',
                    onClick: ({ id, name }) =>
                      this.renderDeleteRecord('Delete TXT Record', id, name),
                  },
                ]}
                data={txtRecords}
                noDataMessage="You have no TXT records."
              />
            </Card>
          </section>
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
                { dataKey: 'name', label: 'Service' },
                { dataKey: 'priority', label: 'Priority' },
                {
                  cellComponent: LabelCell,
                  headerClassName: 'LabelColumn',
                  dataKey: 'domain',
                  label: 'Domain',
                  titleKey: 'domain',
                  tooltipEnabled: true,
                },
                { dataKey: 'weight', label: 'Weight' },
                { dataKey: 'port', label: 'Port' },
                {
                  cellComponent: LabelCell,
                  headerClassName: 'LabelColumn',
                  dataKey: 'target',
                  label: 'Target',
                  titleKey: 'target',
                  tooltipEnabled: true,
                },
                { dataKey: 'ttl_sec', label: 'TTL' },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditSRVRecord('Edit SRV Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
                  text: 'Delete',
                  onClick: ({ id, name }) => this.renderDeleteRecord('Delete SRV Record', id, name),
                },
              ]}
              data={srvRecords}
              noDataMessage="You have no SRV records."
            />
          </Card>
        </div>
      </div>
    );
  }
}

MasterZone.propTypes = {
  dispatch: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

export default connect()(MasterZone);
