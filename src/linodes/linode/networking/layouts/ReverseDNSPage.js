import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { showModal, hideModal } from '~/actions/modal';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { Card } from '~/components/cards';
import { Table } from '~/components/tables';
import { ButtonCell } from '~/components/tables/cells';
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
    this.getLinode = getLinode.bind(this);

    this.state = { resetting: {} };
  }

  async resetRDNS(record) {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    const address = record.address;

    this.setState({ resetting: { ...this.state.resetting, [address]: true } });
    await dispatch(setRDNS(linode.id, address, null));
    this.setState({ resetting: { ...this.state.resetting, [address]: false } });
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
      { label: 'IP Address', dataKey: 'address' },
      { label: 'Target', dataKey: 'rdns' },
      {
        cellComponent: ButtonCell,
        onClick: (record) => {
          this.resetRDNS(record);
        },
        text: 'Reset',
        isDisabledFn: (record) => {
          return this.state.resetting[record.address];
        },
      },
      {
        cellComponent: ButtonCell,
        buttonClassName: 'EditButton',
        onClick: (record) => {
          this.renderEditRDNS(record);
        },
        text: 'Edit',
      },
    ];
    const linode = this.getLinode();
    const ips = linode._ips;

    // TODO: slaac and global should show up here but they are not supported by the API yet
    const records = [...ips.ipv4.public, ...ips.ipv6.addresses];

    return (
      <Card title="Reverse DNS">
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
  linodes: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(ReverseDNSPage);
