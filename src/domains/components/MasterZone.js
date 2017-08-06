import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { DeleteModalBody } from 'linode-components/modals';
import { PrimaryButton } from 'linode-components/buttons';
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
    return TXT || [];
  }

  formatCNAMERecords() {
    const { domain } = this.props;

    const { CNAME } = domain._groupedRecords;
    return (CNAME || []).map(record => ({
      ...record,
      name: record.name || domain.domain,
    }));
  }

  renderDeleteRecord(type, id, name) {
    const { dispatch, domain } = this.props;

    dispatch(showModal(`Delete ${type}`,
      <DeleteModalBody
        onSubmit={async () => {
          await dispatch(domains.records.delete(domain.id, id));
          dispatch(hideModal());
        }}
        items={[name]}
        typeOfItem={type}
        onCancel={() => dispatch(hideModal())}
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
    const { domain, dispatch } = this.props;

    const formatSeconds = (records) => {
      return records.map(record => {
        const { ttl_sec: ttlSec } = record;
        const { ttl_sec: defaultTTLSec } = domain;
        return {
          ...record,
          ttl_sec: formatDNSSeconds(ttlSec, defaultTTLSec, true),
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
      ttl_sec: formatDNSSeconds(domain.ttl_sec, undefined, true),
      refresh_sec: formatDNSSeconds(domain.refresh_sec, undefined, true),
      retry_sec: formatDNSSeconds(domain.retry_sec, undefined, true),
      expire_sec: formatDNSSeconds(domain.expire_sec, 604800, true),
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
                    onClick: () => EditSOARecord.trigger(dispatch, domain),
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
                    <PrimaryButton
                      onClick={() => {
                        this.renderEditRecord('Add NS Record', EditNSRecord);
                      }}
                      buttonClass="btn-default"
                    >
                      Add NS Record
                    </PrimaryButton>
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
                    dataKey: 'target',
                    label: 'Name Server',
                    titleKey: 'target',
                    tooltipEnabled: true,
                  },
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
                      this.renderDeleteRecord('NS Record', id, target),
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
                    <PrimaryButton
                      onClick={() => { this.renderEditRecord('Add MX Record', EditMXRecord); }}
                      buttonClass="btn-default"
                    >
                      Add MX Record
                    </PrimaryButton>
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
                    dataKey: 'target',
                    label: 'Mail Server',
                    titleKey: 'target',
                    tooltipEnabled: true,
                  },
                  { dataKey: 'priority', label: 'Priority', headerClassName: 'WeightColumn' },
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
                      this.renderDeleteRecord('MX Record', id, target),
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
                    <PrimaryButton
                      onClick={() => { this.renderEditRecord('Add A/AAAA Record', EditARecord); }}
                      buttonClass="btn-default"
                    >
                      Add A/AAAA Record
                    </PrimaryButton>
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
                  { dataKey: 'ttl_sec', label: 'TTL', headerClassName: 'TTLColumn' },
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
                      this.renderDeleteRecord('A/AAAA Record', id, name),
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
                    <PrimaryButton
                      onClick={() => {
                        this.renderEditRecord('Add CNAME Record', EditCNAMERecord);
                      }}
                      buttonClass="btn-default"
                    >
                      Add CNAME Record
                    </PrimaryButton>
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
                  {
                    cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'target',
                    label: 'Aliases to',
                    titleKey: 'target',
                    tooltipEnabled: true,
                  },
                  { dataKey: 'ttl_sec', label: 'TTL', headerClassName: 'TTLColumn' },
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
                      this.renderDeleteRecord('CNAME Record', id, name),
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
                    <PrimaryButton
                      onClick={() => { this.renderEditRecord('Add TXT Record', EditTXTRecord); }}
                      buttonClass="btn-default"
                    >
                      Add TXT Record
                    </PrimaryButton>
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
                  { dataKey: 'ttl_sec', label: 'TTL', headerClassName: 'TTLColumn' },
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
                      this.renderDeleteRecord('TXT Record', id, name),
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
                  <PrimaryButton
                    onClick={() => { this.renderEditRecord('Add SRV Record', EditSRVRecord); }}
                    buttonClass="btn-default"
                  >
                    Add SRV Record
                  </PrimaryButton>
                }
              />
            }
          >
            <Table
              className="Table--secondary"
              columns={[
                { dataKey: 'name', label: 'Service', headerClassName: 'ServiceColumn' },
                { dataKey: 'priority', label: 'Priority', headerClassName: 'WeightColumn' },
                {
                  cellComponent: LabelCell,
                  headerClassName: 'LabelColumn',
                  dataKey: 'domain',
                  label: 'Domain',
                  titleKey: 'domain',
                  tooltipEnabled: true,
                },
                { dataKey: 'weight', label: 'Weight', headerClassName: 'WeightColumn' },
                { dataKey: 'port', label: 'Port', headerClassName: 'PortColumn' },
                {
                  cellComponent: LabelCell,
                  headerClassName: 'LabelColumn',
                  dataKey: 'target',
                  label: 'Target',
                  titleKey: 'target',
                  tooltipEnabled: true,
                },
                { dataKey: 'ttl_sec', label: 'TTL', headerClassName: 'TTLColumn' },
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
                  onClick: ({ id, name }) => this.renderDeleteRecord('SRV Record', id, name),
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
