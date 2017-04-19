import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { showModal, hideModal } from '~/actions/modal';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { ButtonCell } from 'linode-components/tables/cells';
import { setError } from '~/actions/errors';
import { linodeIPs, setRDNS } from '~/api/linodes';
import EditRDNS from '../components/EditRDNS';

export class ReverseDNSPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

    try {
      await dispatch(linodeIPs(id));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  constructor() {
    super();

    this.state = { loading: {} };
  }

  async resetRDNS(record) {
    const { dispatch, linode } = this.props;
    const address = record.address;

    this.setState({ loading: { ...this.state.loading, [address]: true } });
    await dispatch(setRDNS(linode.id, address, null));
    this.setState({ loading: { ...this.state.loading, [address]: false } });
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
        className: 'ResetButton',
        isDisabledFn: (record) => {
          return this.state.loading[record.address];
        },
      },
      {
        cellComponent: ButtonCell,
        headerClassName: 'ButtonColumn',
        buttonClassName: 'EditButton',
        onClick: (record) => {
          this.renderEditRDNS(record);
        },
        text: 'Edit',
      },
    ];
    const { linode } = this.props;
    const ips = linode._ips;

    // TODO: global should show up here but they are not supported by the API yet?
    const records = [...ips.ipv4.public, ...ips.ipv6.addresses, ips.ipv6.slaac];

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
