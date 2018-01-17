import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import DeleteModalBody from 'linode-components/dist/modals/DeleteModalBody';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import ListGroup from 'linode-components/dist/lists/bodies/ListGroup';
import Dropdown from 'linode-components/dist/dropdowns/Dropdown';
import List from 'linode-components/dist/lists/List';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';
import Table from 'linode-components/dist/tables/Table';
import TableCell from 'linode-components/dist//tables/cells/TableCell';
import LabelCell from 'linode-components/dist//tables/cells/LabelCell';

import { setSource } from '~/actions/source';
import { addIP, deleteIP, setRDNS } from '~/api/ad-hoc/networking';
import { dispatchOrStoreErrors } from '~/api/util';
import { PortalModal } from '~/components/modal';
import { hideModal } from '~/utilities';

import { MoreInfo, EditRDNS, AddIP } from '../components';
import { selectLinode } from '../../utilities';


export class SummaryPage extends Component {
  constructor(props) {
    super(props);
    this.state = { modal: null };

    this.hideModal = hideModal.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  resetRDNS = (ip, linodeId) => {
    const { dispatch } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setRDNS(ip, linodeId, null),
    ], [], ip.address));
  }

  addIpModal = (linode) => {
    this.setState({
      modal: {
        title: AddIP.title,
        name: 'addIp',
        linode: linode,
      },
    });
  }

  deleteIpModal = (ip) => {
    this.setState({
      modal: {
        title: AddIP.title,
        name: 'deleteIp',
        ip: ip,
      },
    });
  }

  moreInfoModal = (ip) => {
    this.setState({
      modal: {
        title: MoreInfo.title,
        name: 'moreInfo',
        ip: ip,
      },
    });
  }

  editRDNSModal = (ip, linodeId) => {
    this.setState({
      modal: {
        title: EditRDNS.title,
        name: 'editRDNS',
        ip: ip,
        linodeId: linodeId,
      },
    });
  }

  renderModal = () => {
    const { dispatch } = this.props;
    const { modal } = this.state;
    if (!modal) {
      return null;
    }
    const { name, title, linode, ip, linodeId } = modal;
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'addIp') &&
          <AddIP
            dispatch={dispatch}
            linode={linode}
            close={this.hideModal}
          />
        }
        {(name === 'moreInfo') &&
          <FormModalBody
            onSubmit={this.hideModal}
            noCancel
            buttonText="Done"
            buttonDisableText="Done"
            analytics={{ title: MoreInfo.title, action: 'info' }}
          >
            <MoreInfo dispatch={dispatch} ip={ip} />
          </FormModalBody>
        }
        {(name === 'editRDNS') &&
          <EditRDNS
            ip={ip}
            linodeId={linodeId}
            dispatch={dispatch}
            close={this.hideModal}
          />
        }
        {(name === 'deleteIp') &&
          <DeleteModalBody
            onSubmit={async () => {
              dispatch(deleteIP(ip));
              dispatch(hideModal());
            }}
            items={[ip.address]}
            typeOfItem="IPs"
            onCancel={this.hideModal}
          />
        }
      </PortalModal>
    );
  }

  renderAddButton() {
    const { dispatch, linode } = this.props;

    const privateIPv4s = Object.values(linode._ips).filter(
      ip => ip.version === 'ipv4' && ip.type === 'private');
    if (privateIPv4s.length) {
      return (
        <PrimaryButton
          className="float-sm-right"
          buttonClass="btn-default"
          onClick={() => this.addIpModal(linode)}
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
        options={[{ name: 'Add a Public IP Address', action: () => this.addIpModal(linode) }]}
      >
        Enable Private IPv4
      </PrimaryButton>
    );
  }

  renderIPNav = ({ column, record }) => {
    const { linode } = this.props;

    if (record.type.toLowerCase() === 'link-local') {
      return <TableCell column={column} record={record} />;
    }

    const groups = [
      { elements: [{ name: 'More Info', action: () => this.moreInfoModal(record) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteIpModal(record) }] },
    ];

    const numPublicIPv4 = Object.values(linode._ips).filter(
      ip => ip.type === 'public' && ip.version === 'ipv4').length;

    if (['slaac', 'link-local', 'private'].indexOf(record.type.toLowerCase()) !== -1
      || numPublicIPv4 === 1) {
      // Cannot delete slaac, link-local, private, or last public IPv4 address.
      groups.pop();
    }

    if (['private', 'link-local', 'pool'].indexOf(record.type.toLowerCase()) === -1) {
      groups.splice(1, 0, {
        elements: [
          { name: 'Edit RDNS', action: () => this.editRDNSModal(record, linode.id) },
        ],
      });

      if (record.rdns && ! /\.members\.linode\.com$/.test(record.rdns)) {
        const name = record.version === 'ipv4' ? 'Reset RDNS' : 'Remove RDNS';
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

  renderIPSection(ips, type) {
    return (
      <ListGroup name={type} key={type}>
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
              dataKey: 'type',
              label: 'Type',
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

  render() {
    const { linode } = this.props;

    const ipv4s = Object.values(linode._ips).filter(ip => ip.version === 'ipv4').map(ip => ({
      ...ip,
      type: capitalize(ip.type),
    }));

    const ipv6s = Object.values(linode._ips).filter(ip => ip.version === 'ipv6').map(ip => {
      let type = capitalize(ip.type);
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
          {this.renderModal()}
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
