import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { domains } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';

import MasterZone from '../components/MasterZone';
import SlaveZone from '../components/SlaveZone';


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

  render() {
    const { domain, dispatch } = this.props;

    if (domain.type === 'slave') {
      return (
        <SlaveZone
          dispatch={dispatch}
          domain={domain}
        />
      );
    }

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
          <div className="container clearfix">
            <div className="float-sm-left">
              <Link to="/domains">Domains</Link>
              <h1 title={domain.id}>
                <Link to={`/domains/${domain.domain}`}>
                  {domain.group ? `${domain.group} / ${domain.domain}` : domain.domain}
                </Link>
              </h1>
            </div>
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
                  headerClassName: 'ButtonColumn',
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditMXRecord('Edit MX Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
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
                  headerClassName: 'ButtonColumn',
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
                  headerClassName: 'ButtonColumn',
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditCNAMERecord('Edit CNAME Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
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
                  headerClassName: 'ButtonColumn',
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditTXTRecord('Edit TXT Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
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
                  headerClassName: 'ButtonColumn',
                  text: 'Edit',
                  onClick: ({ id }) => this.renderEditSRVRecord('Edit SRV Record', id),
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
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
