import React, { Component, PropTypes } from 'react';

import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { DeleteModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { linodes } from '~/api';

import { AddModal } from './AddModal';
import { EditModal } from './EditModal';


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

export class DiskPanel extends Component {
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

  editAction(d) {
    const { dispatch, linode } = this.props;

    return () => dispatch(showModal('Edit Disk', (
      <EditModal
        free={this.freeSpace()}
        linode={linode}
        disk={d}
        dispatch={dispatch}
      />
    )));
  }

  deleteAction(d) {
    const { dispatch, linode } = this.props;

    return () => dispatch(showModal('Delete Disk', (
      <DeleteModalBody
        onCancel={() => dispatch(hideModal())}
        onOk={() => {
          dispatch(linodes.disks.delete(linode.id, d.id));
          dispatch(hideModal());
        }}
        typeOfItem="Disks"
        items={[d.label]}
      />
    )));
  }

  addAction = () => {
    const { dispatch, linode, distributions } = this.props;

    return dispatch(showModal('Add a Disk', (
      <AddModal
        distributions={distributions}
        free={this.freeSpace()}
        linode={linode}
        dispatch={dispatch}
      />
    )));
  }

  renderStatusMessage() {
    if (!this.poweredOff()) {
      return (
        <section>
          <div className="alert alert-info">
            Your Linode must be powered off to manage your disks.
          </div>
        </section>
      );
    }

    return null;
  }

  render() {
    const { linode: { _disks: { disks } } } = this.props;
    const free = this.freeSpace();
    const header = <CardHeader title="Disks" />;

    return (
      <Card header={header}>
        <section className="disk-layout">
          {Object.values(disks).map(d =>
            <div
              className={`disk disk-${d.state}`}
              key={d.id}
              style={{
                flexGrow: d.size,
                borderColor: borderColors[Object.values(disks).indexOf(d) % borderColors.length],
              }}
            >
              <h3 title={d.id}>{d.label} <small>{d.filesystem}</small></h3>
              <p>{d.size} MB</p>
              {d.state !== 'deleting' ? null :
                <small className="text-muted">Being deleted</small>}
                {!this.poweredOff() || d.state === 'deleting' ? null : (
                  <div>
                    <Button onClick={this.editAction(d)}>Edit</Button>
                    <Button onClick={this.deleteAction(d)}>Delete</Button>
                  </div>
                )}
            </div>
          )}
          <div className="disk free" style={{ flexGrow: free }}>
            <h3>Unallocated</h3>
            <p>{free} MB</p>
            {!this.poweredOff() ? null : (
              <Button onClick={this.addAction} disabled={free === 0}>Add a disk</Button>
            )}
          </div>
        </section>
        {this.renderStatusMessage()}
      </Card>
    );
  }
}

DiskPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  distributions: PropTypes.object.isRequired,
};
