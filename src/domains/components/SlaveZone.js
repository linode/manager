import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { replace } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { ButtonCell } from 'linode-components/tables/cells';

import { showModal, hideModal } from '~/actions/modal';
import EditSOARecord from '../components/EditSOARecord';


export class SlaveZone extends Component {
  renderSOAEditRecord() {
    const { dispatch, domain } = this.props;

    dispatch(showModal(
      'Edit SOA Record',
      <EditSOARecord
        dispatch={dispatch}
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
        zone: domain,
        close: () => dispatch(hideModal()),
      }),
    ));
  }

  renderEditSOARecord(title) {
    return this.renderEditRecord(title, EditSOARecord);
  }

  render() {
    const { domain } = this.props;

    const { axfr_ips, master_ips } = domain;

    const soaRecord = {
      ...domain,
      axfr_ips: axfr_ips.map(ip => <div key={ip}>{ip}</div>),
      master_ips: master_ips.map(ip => <div key={ip}>{ip}</div>),
    };

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <Link to="/domains">Domains</Link>
            <h1 title={domain.id}>
              {domain.group ? `${domain.group} / ` : ''}
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
                { dataKey: 'axfr_ips', label: 'Domain Transfers' },
                { dataKey: 'master_ips', label: 'Masters' },
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
        </div>
      </div>
    );
  }
}

SlaveZone.propTypes = {
  dispatch: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

export default connect()(SlaveZone);
