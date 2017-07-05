import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import { Dropdown } from 'linode-components/dropdowns';
import { List } from 'linode-components/lists';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { TableCell } from 'linode-components/tables/cells';

import { showModal, hideModal } from '~/actions/modal';
import { setSource } from '~/actions/source';
import { deleteIP, setRDNS } from '~/api/networking';
import { dispatchOrStoreErrors } from '~/api/util';
import { EmitEvent } from 'linode-components/utils';

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
        onOk={async () => {
          dispatch(deleteIP(ip.address));
          dispatch(hideModal());
        }}
        items={[ip.address]}
        typeOfItem="IPs"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  };

  renderIPNav = ({ column, record }) => {
    const { dispatch } = this.props;

    if (record.type.toLowerCase() === 'link-local') {
      return <TableCell column={column} record={record} />;
    }

    const elements = [
      { name: 'More Info', action: () => {
        MoreInfo.trigger(dispatch, record);
        EmitEvent('dropdown:click', 'Dropdown', 'More Info', 'network summary ips');
      } },
      //{ name: 'Delete', action: () => this.deleteIP(record) },
    ];

    // TODO: add once there's support for deleting.
    // if (['slaac', 'link-local'].indexOf(record.type.toLowerCase()) !== -1) {
    //  // Cannot delete slaac address.
    //  elements.pop();
    // }

    if (['private', 'link-local', 'pool'].indexOf(record.type.toLowerCase()) === -1) {
      elements.splice(1, 0, {
        name: 'Edit RDNS',
        action: () => {
          EditRDNS.trigger(dispatch, record);
          EmitEvent('dropdown:click', 'Dropdown', 'Edit RDNS', 'network summary ips');
        },
      });

      if (record.rdns) {
        const name = record.version === 'ipv4' ? 'Reset RDNS' : 'Remove RDNS';
        elements.splice(2, 0, { name, action: () => {
          this.resetRDNS(record);
          EmitEvent('dropdown:click', 'Dropdown', name, 'network summary ips');
        } });
      }
    }

    return (
      <TableCell column={column} record={record}>
        <Dropdown
          elements={elements}
          onOpen={() => {
            EmitEvent('dropdown:open', 'Dropdown', 'open', 'network summary ips');
          }}
          onClose={() => {
            EmitEvent('dropdown:close', 'Dropdown', 'close', 'network summary ips');
          }}
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

  render() {
    const { dispatch, linode } = this.props;

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

    const buttonElements = [
      { name: 'Add an IP Address', action: () => {
        AddIP.trigger(dispatch, linode);
        EmitEvent('dropdown:click', 'Dropdown', 'add ip address', 'network summary add');
      } },
      // TODO: Add rdnslookup when API supports it
      // { name: 'Add an RDNS Entry', action: this.rdnsLookup },
    ];

    return (
      <div>
        <header className="NavigationHeader clearfix">
          <div className="float-sm-right">
            <Dropdown
              elements={buttonElements}
              onOpen={() => {
                EmitEvent('dropdown:open', 'Dropdown', 'open', 'network summary add');
              }}
              onClose={() => {
                EmitEvent('dropdown:close', 'Dropdown', 'close', 'network summary add');
              }}
            />
          </div>
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
