import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import { Dropdown } from 'linode-components/dropdowns';
import { List } from 'linode-components/lists';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { TableCell } from 'linode-components/tables/cells';

import { showModal, hideModal } from '~/actions/modal';
import { setSource } from '~/actions/source';
import { addIP, deleteIP, setRDNS } from '~/api/networking';
import { dispatchOrStoreErrors } from '~/api/util';

import { MoreInfo, EditRDNS, AddIP } from '../components';
import { selectLinode } from '../../utilities';


export class SummaryPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  resetRDNS = (ip) => {
    const { dispatch } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setRDNS(ip, null),
    ], [], ip.address));
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
      ip => ip.type === 'public' && ip.version === 'ipv4').length;

    if (['slaac', 'link-local', 'private'].indexOf(record.type.toLowerCase()) !== -1
        || numPublicIPv4 === 1) {
      // Cannot delete slaac, link-local, private, or last public IPv4 address.
      groups.pop();
    }

    if (['private', 'link-local', 'pool'].indexOf(record.type.toLowerCase()) === -1) {
      groups.splice(1, 0, { elements: [
        { name: 'Edit RDNS', action: () => EditRDNS.trigger(dispatch, record) },
      ] });

      if (record.rdns) {
        const name = record.version === 'ipv4' ? 'Reset RDNS' : 'Remove RDNS';
        groups[1].elements.push({
          name, action: () => this.resetRDNS(record),
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

  renderIPSection(ips, type) {
    return (
      <ListGroup name={type} key={type}>
        <Table
          className="Table--secondary"
          columns={[

            {
              dataKey: 'address',
              label: 'Address',
            },
            {
              dataKey: 'rdns',
              label: 'Reverse DNS',
            },
            {
              dataKey: 'type',
              label: 'Type',
              headerClassName: 'hidden-md-down',
              className: 'hidden-md-down',
            },
            {
              cellComponent: this.renderIPNav,
              headerClassName: 'IPNavColumn',
            },
          ]}
          data={ips}
          noDataMessage={`You have no ${type} addresses.`}
        />
      </ListGroup>
    );
  }

  renderAddButton() {
    const { dispatch, linode } = this.props;

    const addIPModal = () => AddIP.trigger(dispatch, linode);

    const privateIPv4s = Object.values(linode._ips).filter(
      ip => ip.version === 'ipv4' && ip.type === 'private');
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
        Add a Private IP Address
      </PrimaryButton>
    );
  }

  render() {
    const { linode } = this.props;

    const ipv4s = Object.values(linode._ips).filter(ip => ip.version === 'ipv4').map(ip => ({
      ...ip,
      type: _.capitalize(ip.type),
    }));

    const ipv6s = Object.values(linode._ips).filter(ip => ip.version === 'ipv6').map(ip => {
      let type = _.capitalize(ip.type);
      let address = `${ip.address} / ${ip.prefix}`;
      if (ip.type === 'slaac') {
        type = 'SLAAC';
      } else if (ip.type === 'link-local') {
        type = 'Link-Local';
        address = ip.address;
      } else if (ip.type === 'pool') {
        address = ip.range;
      }

      return { ...ip, type, address };
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
