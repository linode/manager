import React, { Component, PropTypes } from 'react';

import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { Dropdown } from 'linode-components/dropdowns';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { LabelCell, TableCell } from 'linode-components/tables/cells';

import { hideModal, showModal } from '~/actions/modal';
import { linodes } from '~/api';

import AddDisk from './AddDisk';
import EditDisk from './EditDisk';


export default class Disks extends Component {
  poweredOff() {
    return [
      'offline', 'contact_support', 'provisioning',
    ].indexOf(this.props.linode.status) !== -1;
  }

  freeSpace() {
    const { linode } = this.props;
    const disks = Object.values(linode._disks.disks);
    const total = linode.type.storage;
    const used = disks.reduce((total, disk) => total + disk.size, 0);
    return total - used;
  }

  deleteDisk(d) {
    const { dispatch, linode } = this.props;

    return () => dispatch(showModal('Delete Disk', (
      <DeleteModalBody
        onCancel={() => dispatch(hideModal())}
        onSubmit={() => {
          dispatch(linodes.disks.delete(linode.id, d.id));
          dispatch(hideModal());
        }}
        typeOfItem="Disks"
        items={[d.label]}
      />
    )));
  }

  renderStatusMessage() {
    if (!this.poweredOff()) {
      return (
        <div>
          <div className="alert alert-info">
            Your Linode must be powered off to manage your disks.
          </div>
        </div>
      );
    }

    return null;
  }

  renderDiskNav = ({ column, record }) => {
    const { dispatch, linode } = this.props;
    const free = this.freeSpace();

    const groups = [
      { elements: [{ name: 'Edit', action: () => EditDisk.trigger(dispatch, linode, record, free) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteDisk(record) }] },
    ];

    return (
      <TableCell column={column} record={record}>
        <Dropdown
          groups={groups}
          analytics={{ title: 'Disk actions' }}
        />
      </TableCell>
    );
  }

  render() {
    const { dispatch, linode, distributions } = this.props;
    const disks = Object.values(linode._disks.disks);
    const free = this.freeSpace();

    const nav = (
      <PrimaryButton
        className="float-right"
        buttonClass="btn-default"
        onClick={() => AddDisk.trigger(dispatch, linode, distributions, free)}
      >
        Add a Disk
      </PrimaryButton>
    );

    const header = <CardHeader title="Disks" nav={nav} />;

    return (
      <Card header={header}>
        <Table
          className="Table--secondary"
          columns={[
            {
              cellComponent: LabelCell,
              dataKey: 'label',
              label: 'Label',
            },
            { dataKey: 'size', label: 'Size', formatFn: (s) => `${s} MB` },
            {
              cellComponent: this.renderDiskNav,
              headerClassName: 'DiskNavColumn',
            },
          ]}
          data={disks}
          noDataMessage="You have no disks."
        />
      </Card>
    );
  }
}

Disks.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  distributions: PropTypes.object.isRequired,
};
