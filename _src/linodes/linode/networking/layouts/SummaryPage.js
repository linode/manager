import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import ListGroup from 'linode-components/dist/lists/bodies/ListGroup';
import Dropdown from 'linode-components/dist/dropdowns/Dropdown';
import List from 'linode-components/dist/lists/List';
import DeleteModalBody from 'linode-components/dist/modals/DeleteModalBody';
import Table from 'linode-components/dist/tables/Table';
import TableCell from 'linode-components/dist/tables/cells/TableCell';
import LabelCell from 'linode-components/dist/tables/cells/LabelCell';

import { showModal, hideModal } from '~/actions/modal';
import { setSource } from '~/actions/source';
import { addIP, deleteIP, setRDNS } from '~/api/ad-hoc/networking';
import { dispatchOrStoreErrors } from '~/api/util';

import { MoreInfo, EditRDNS, AddIP } from '../components';
import { selectLinode } from '../../utilities';


export class SummaryPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  deleteIP = (ip) => {
    const { dispatch } = this.props;

    return dispatch(showModal('Delete IP Address', (
      <DeleteModalBody
        onSubmit={async () => {
          dispatch(deleteIP(ip));
          dispatch(hideModal());
        }}
        items={[ip.address]}
        typeOfItem="IPs"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  };

  resetRDNS = (ip, linodeId) => {
    const { dispatch } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setRDNS(ip, linodeId, null),
    ], [], ip.address));
  }

  renderAddButton() {
    const { dispatch, linode } = this.props;

    const addIPModal = () => AddIP.trigger(dispatch, linode);

    const privateIPv4s = Object.values(linode._ips).filter(
      ip => ip.type === 'ipv4' && !ip.pubic);
    if (privateIPv4s.length) {
      return (
        <PrimaryButton
          className="float-sm-right"
          buttonClass="btn-default"
          onClick={addIPModal}
        >
          Add an IP Address
        </PrimaryButton>
      );
    }

    return (
      <PrimaryButton
        className="float-sm-right"
        buttonClass="btn-default"
        onClick={() => dispatch(addIP(linode.id, 'private'))}
        options={[{ name: 'Add a Public IP Address', action: addIPModal }]}
      >
        Enable Private IPv4
      </PrimaryButton>
    );
  }

  renderIPNav = ({ column, record }) => {
    const { dispatch, linode } = this.props;

    if (record.type.toLowerCase() === 'link-local') {
      return <TableCell column={column} record={record} />;
    }

    const groups = [
      { elements: [{ name: 'More Info', action: () => MoreInfo.trigger(dispatch, record) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteIP(record) }] },
    ];

    const numPublicIPv4 = Object.values(linode._ips).filter(
      ip => ip.public && ip.type === 'ipv4').length;

    if (['slaac', 'link-local', 'private'].indexOf(record.key.toLowerCase()) !== -1
      || numPublicIPv4 === 1) {
      // Cannot delete slaac, link-local, private, or last public IPv4 address.
      groups.pop();
    }

    if (['private', 'link-local', 'pool'].indexOf(record.type.toLowerCase()) === -1) {
      groups.splice(1, 0, {
        elements: [
          { name: 'Edit RDNS', action: () => EditRDNS.trigger(dispatch, record, linode.id) },
        ],
      });

      if (record.rdns && ! /\.members\.linode\.com$/.test(record.rdns)) {
        const name = record.type === 'ipv4' ? 'Reset RDNS' : 'Remove RDNS';
        groups[1].elements.push({
          name, action: () => this.resetRDNS(record, linode.id),
        });
      }
    }

    return (
      <TableCell column={column} record={record}>
        <Dropdown
          groups={groups}
          analytics={{ title: 'IP actions' }}
        />
      </TableCell>
    );
  }

  renderIPSection(ips, key) {
    return (
      <ListGroup name={key} key={key}>
        <Table
          className="Table--secondary"
          columns={[
            {
              dataKey: 'address',
              label: 'Address',
              headerClassName: 'IPAddressColumn',
            },
            {
              cellComponent: LabelCell,
              headerClassName: 'LabelColumn',
              dataKey: 'rdns',
              label: 'Reverse DNS',
              titleKey: 'rdns',
              tooltipEnabled: true,
            },
            {
              dataKey: 'key',
              label: 'Type',
            },
            {
              cellComponent: this.renderIPNav,
              headerClassName: 'IPNavColumn',
            },
          ]}
          data={ips}
          noDataMessage={`You have no ${key} addresses.`}
        />
      </ListGroup>
    );
  }

  render() {
    const { linode } = this.props;

    const ipv4s = Object.values(linode._ips).filter(ip => ip.type === 'ipv4').map(ip => ({
      ...ip,
      key: capitalize(ip.key),
    }));

    const ipv6s = Object.values(linode._ips).filter(ip => ip.type === 'ipv6').map(ip => {
      let key = capitalize(ip.key);
      let address = `${ip.address} / ${ip.prefix}`;
      if (ip.key === 'slaac') {
        key = 'SLAAC';
      } else if (ip.key === 'link-local') {
        key = 'Link-Local';
        address = ip.address;
      }

      return { ...ip, key, address };
    });

    return (
      <div>
        <header className="NavigationHeader clearfix">
          {/* TODO: Add rdnslookup when API supports it */}
          {this.renderAddButton()}
        </header>
        <List>
          <ListBody>
            {this.renderIPSection(ipv4s, 'IPv4')}
            {this.renderIPSection(ipv6s, 'IPv6')}
          </ListBody>
        </List>
      </div>
    );
  }
}

SummaryPage.propTypes = {
  linode: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectLinode)(SummaryPage);
