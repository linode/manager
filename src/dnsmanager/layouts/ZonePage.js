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
    this.state.currentDNSZone._records.records = _.groupBy(records, 'type');
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

  renderRecords = ({ title, type, labels, keys }) => {
    const records = this.state.currentDNSZone._records.records[type];
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

    return <Card title={title}>{cardContents}</Card>;
  }

  render() {
    const { currentDNSZone } = this.state;

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
            type="NS"
            labels={['Name Server', 'Subdomain', 'TTL']}
            keys={['name', 'target', 'ttl_sec']}
          />
          <this.renderRecords
            title="MX Records"
            type="MX"
            labels={['Mail Server', 'Preference', 'Subdomain']}
            keys={['name', 'priority', 'target']}
          />
          <this.renderRecords
            title="A/AAAA Records"
            type="A"
            labels={['Hostname', 'IP Address', 'TTL']}
            keys={['name', 'target', 'ttl_sec']}
          />
          <this.renderRecords
            title="CNAME Records"
            type="CNAME"
            labels={['Hostname', 'Aliases to', 'TTL']}
            keys={['name', 'target', 'ttl_sec']}
          />
          <this.renderRecords
            title="TXT Records"
            type="TXT"
            labels={['Name', 'Value', 'TTL']}
            keys={['name', 'target', 'ttl_sec']}
          />
          <this.renderRecords
            title="SRV Records"
            type="SRV"
            labels={['Service', 'Priority', 'Weight', 'Port', 'Target', 'TTL']}
            keys={['name', 'priority', 'weight', 'port', 'target', 'ttl_sec']}
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
