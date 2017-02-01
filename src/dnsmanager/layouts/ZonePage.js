import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { setError } from '~/actions/errors';
import { showModal, hideModal } from '~/actions/modal';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import { dnszones } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { Button } from '~/components/buttons';
import Card from '~/components/Card';
import SecondaryTable from '~/components/SecondaryTable';
import { NAME_SERVERS } from '~/constants';

export class IndexPage extends Component {
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
    this.state = {
      currentDNSZone: Object.values(props.dnszones.dnszones).filter(
        d => d.dnszone === props.params.dnszoneLabel)[0],
    };

    const records = this.state.currentDNSZone._records.records;
    this.state.currentDNSZone._groupedRecords = _.groupBy(records, 'type');
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('DNS Manager'));
  }

  deleteZone(zoneId) {
    const { dispatch } = this.props;
    dispatch(showModal('Delete DNS Zone', this.renderModal(zoneId)));
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

    return currentDNSZone._groupedRecords.SRV.map(r => ({
      ...r, domain: currentDNSZone.dnszone,
    }));
  }

  renderRecords = ({ title, rows, labels, keys }) => {
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

    return <Card title={title}>{cardContents}</Card>;
  }

  renderModal(zoneId) {
    const { dispatch } = this.props;
    return (
      <ConfirmModalBody
        buttonText="Delete"
        onOk={async () => {
          await dispatch(dnszones.delete(zoneId));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        <span className="text-danger">WARNING!</span> This will permanently
        delete this DNS Zone. Confirm below to proceed.
      </ConfirmModalBody>
    );
  }

  render() {
    const { currentDNSZone } = this.state;
    const { CNAME: _cnameRecords, TXT: _txtRecords } = currentDNSZone._groupedRecords;

    const setDefaultTTL = (records) => records.map(r => ({
      ...r, ttl_sec: r.ttl_sec || 'Default',
    }));
    const addNav = (records) => records.map(r => ({
      ...r, nav: <Button>Delete</Button>,
    }));

    const nsRecords = setDefaultTTL(this.formatNSRecords());
    const mxRecords = setDefaultTTL(addNav(this.formatMXRecords()));
    const aRecords = setDefaultTTL(addNav(this.formatARecords()));
    const cnameRecords = setDefaultTTL(addNav(_cnameRecords));
    const txtRecords = setDefaultTTL(addNav(_txtRecords));
    const srvRecords = setDefaultTTL(addNav(this.formatSRVRecords()));

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow">
            <h1>{currentDNSZone.dnszone}</h1>
          </div>
        </header>
        <div className="PrimaryPage-body">
          <Card title="SOA Record" nav={<Button>Edit record</Button>}>
            <div className="row">
              <div className="col-sm-2 label-col">
                <label>Primary DNS</label>
              </div>
              <div className="col-sm-10">
                <span className="input-line-height">{currentDNSZone.dnszone}</span>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-2 label-col">
                <label>Email</label>
              </div>
              <div className="col-sm-10">
                <span className="input-line-height">{currentDNSZone.soa_email}</span>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-2 label-col">
                <label>Default TTL</label>
              </div>
              <div className="col-sm-10">
                <span className="input-line-height">{currentDNSZone.ttl_sec || 'Default'}</span>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-2 label-col">
                <label>Refresh Rate</label>
              </div>
              <div className="col-sm-10">
                <span className="input-line-height">{currentDNSZone.refresh_sec || 'Default'}</span>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-2 label-col">
                <label>Retry Rate</label>
              </div>
              <div className="col-sm-10">
                <span className="input-line-height">{currentDNSZone.retry_sec || 'Default'}</span>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-2 label-col">
                <label>Expire Time</label>
              </div>
              <div className="col-sm-10">
                <span className="input-line-height">{currentDNSZone.expire_sec || 'Default'}</span>
              </div>
            </div>
          </Card>
          <this.renderRecords
            title="NS Records"
            rows={nsRecords}
            labels={['Name Server', 'Subdomain', 'TTL', '']}
            keys={['target', 'name', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="MX Records"
            rows={mxRecords}
            labels={['Mail Server', 'Preference', 'Subdomain', '']}
            keys={['target', 'priority', 'name', 'nav']}
          />
          <this.renderRecords
            title="A/AAAA Records"
            rows={aRecords}
            labels={['Hostname', 'IP Address', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="CNAME Records"
            rows={cnameRecords}
            labels={['Hostname', 'Aliases to', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="TXT Records"
            rows={txtRecords}
            labels={['Name', 'Value', 'TTL', '']}
            keys={['name', 'target', 'ttl_sec', 'nav']}
          />
          <this.renderRecords
            title="SRV Records"
            rows={srvRecords}
            labels={['Service', 'Priority', 'Domain', 'Weight', 'Port', 'Target', 'TTL', '']}
            keys={['name', 'priority', 'domain', 'weight', 'port', 'target', 'ttl_sec', 'nav']}
          />
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
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

export default connect(select)(IndexPage);
