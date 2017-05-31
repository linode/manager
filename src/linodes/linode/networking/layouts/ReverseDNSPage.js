import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { ButtonCell } from 'linode-components/tables/cells';

import { showModal, hideModal } from '~/actions/modal';
import { setRDNS } from '~/api/networking';
import { dispatchOrStoreErrors } from '~/components/forms';

import EditRDNS from '../components/EditRDNS';
import { selectLinode } from '../../utilities';


export class ReverseDNSPage extends Component {
  constructor() {
    super();

    this.state = { loading: {} };
  }

  resetRDNS = (record) => {
    const { dispatch } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setRDNS(record, null),
    ], [], record.address));
  }

  renderEditRDNS(ip) {
    const { dispatch } = this.props;

    dispatch(showModal(
      'Edit RDNS Entry',
      <EditRDNS
        ip={ip}
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    ));
  }

  render() {
    const columns = [
      { label: 'IP Address', dataKey: 'address', headerClassName: 'IPAddressColumn' },
      { label: 'Target', dataKey: 'rdns' },
      {
        cellComponent: ButtonCell,
        headerClassName: 'ButtonColumn',
        onClick: (record) => {
          this.resetRDNS(record);
        },
        text: 'Reset',
        isDisabledFn: (record) => {
          return this.state.loading[record.address];
        },
      },
      {
        cellComponent: ButtonCell,
        headerClassName: 'ButtonColumn',
        onClick: (record) => {
          this.renderEditRDNS(record);
        },
        text: 'Edit',
      },
    ];
    const { linode } = this.props;
    const ips = linode._ips;

    // TODO: global should show up here but they are not supported by the API yet?
    const records = [...ips.ipv4.public, ...ips.ipv6.addresses, ips.ipv6.slaac].filter(
      address => address.rdns);

    return (
      <Card header={<CardHeader title="Reverse DNS" />}>
        <Table
          className="Table--secondary"
          columns={columns}
          data={records}
        />
      </Card>
    );
  }
}

ReverseDNSPage.propTypes = {
  linode: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectLinode)(ReverseDNSPage);
