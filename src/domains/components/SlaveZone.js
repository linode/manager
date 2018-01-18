import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { Link } from 'react-router-dom';

import { Card, CardHeader } from 'linode-components';
import { Table } from 'linode-components';
import { ButtonCell } from 'linode-components';

import { PortalModal } from '~/components/modal';
import EditSOARecord from '../components/EditSOARecord';

export class SlaveZone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.initModalState(),
    };
  }

  initModalState = () => ({ activeModal: null });

  showSOAModal = () => this.setState({ activeModal: 'editSOARecord' });

  hideModal = () => this.setState({ ...this.initModalState() });

  renderModal = () => {
    const { domain, dispatch } = this.props;
    const { activeModal } = this.state;
    if (!activeModal) {
      return null;
    }
    return (
      <PortalModal
        title={EditSOARecord.title}
        onClose={this.hideModal}
      >
        <EditSOARecord
          dispatch={dispatch}
          domains={domain}
          close={(newDomain) => () => {
            this.hideModal();
            if (newDomain) {
              dispatch(replace(`/domains/${newDomain || domain.domain}`));
            }
          }}
        />
      </PortalModal>
    );
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
        {this.renderModal()}
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
                  onClick: () => this.showSOAModal(),
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
