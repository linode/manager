import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { showModal, hideModal } from '~/actions/modal';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { Card } from '~/components/cards';
import SecondaryTable from '~/components/SecondaryTable';
import { setError } from '~/actions/errors';
import { linodeIPs, setRDNS } from '~/api/linodes';
import { Button } from '~/components/buttons';
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

  renderEditRDNS(ip) {
    const { dispatch } = this.props;
    return () => dispatch(showModal(
      'Edit RDNS Entry',
      <EditRDNS
        ip={ip}
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    ));
  }

  render() {
    const { dispatch } = this.props;

    const labels = ['IP Address', 'Target', ''];
    const keys = ['address', 'rdns', 'nav'];
    const linode = this.getLinode();
    const ips = linode._ips;

    const addNav = (ips) => ips.map((ip, i) => ({
      ...ip,
      nav: (
        <div>
          <Button
            className="btn-secondary"
            onClick={async () => {
              this.setState({ resetting: { ...this.state.resetting, [ip.address]: true } });
              await dispatch(setRDNS(linode.id, ip.address, null));
              this.setState({ resetting: { ...this.state.resetting, [ip.address]: false } });
            }}
            id={`reset-${i}`}
            disabled={this.state.resetting[ip.address]}
          >Reset</Button>
          <Button
            className="btn-secondary"
            onClick={this.renderEditRDNS(ip)}
            id={`edit-${i}`}
          >Edit</Button>
        </div>
      ),
    }));
    // TODO: slaac and global should show up here but they are not supported by the API yet
    const records = addNav([...ips.ipv4.public, ...ips.ipv6.addresses]);

    return (
      <Card title="Reverse DNS">
        <SecondaryTable
          labels={labels}
          keys={keys}
          rows={records}
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
