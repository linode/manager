import React, { Component, PropTypes } from 'react';

import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { LabelCell, ButtonCell } from 'linode-components/tables/cells';

import { hideModal, showModal } from '~/actions/modal';
import { linodes } from '~/api';

import AddDisk from './AddDisk';
import EditDisk from './EditDisk';


const borderColors = [
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#16a085',
  '#f1c40f',
  '#27ae60',
  '#2980b9',
  '#2ecc71',
  '#e67e22',
];

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

  deleteAction(d) {
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

  render() {
    const { dispatch, linode, distributions } = this.props;
    const disks = Object.values(linode._disks.disks);
    const free = this.freeSpace();

    const nav = (
      <PrimaryButton
        className="float-sm-right"
        buttonClass="btn-default"
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
              cellComponent: ButtonCell,
              headerClassName: 'ButtonColumn',
              onClick: (disk) => { this.deleteDisk(linode, disk); },
              text: 'Delete',
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
