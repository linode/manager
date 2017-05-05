import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';

import { showModal } from '~/actions/modal';

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
      'offline', 'contact_support', 'provisioning'
    ].indexOf(this.props.linode.status) !== -1;
  }

  renderStatusMessage(status) {
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
    const { dispatch, linode, distributions } = this.props;
    const disks = Object.values(linode._disks.disks);
    const total = linode.type.storage;
    const used = disks.reduce((total, disk) => total + disk.size, 0);
    const free = total - used;

    const addModal = <AddModal distributions={distributions} free={free} linode={linode} />;

    const editModal = d => (
      <EditModal
        free={free}
        linode={linode}
        disk={d}
        dispatch={dispatch}
      />
    );

    const deleteModal = d => (
      <DeleteModal
        linode={linode}
        disk={d}
        dispatch={dispatch}
      />
    );

    return (
      <Card
        header={
          <CardHeader title="Disks" navLink="https://example.org" />
        }
      >
        <section className="disk-layout">
          {disks.map(d =>
            <div
              className={`disk disk-${d.state}`}
              key={d.id}
              style={{
                flexGrow: d.size,
                borderColor: borderColors[disks.indexOf(d) % borderColors.length],
              }}
            >
              <h3 title={d.id}>{d.label} <small>{d.filesystem}</small></h3>
              <p>{d.size} MB</p>
              {d.state !== 'deleting' ? null :
                <small className="text-muted">Being deleted</small>}
                {!this.poweredOff() || d.state === 'deleting' ? null : (
                  <div>
                    <Button
                      onClick={() => dispatch(showModal('Edit disk', editModal(d)))}
                    >Edit</Button>
                    <Button
                      className="LinodesLinodeSettingsComponentsDiskPanel-delete"
                      onClick={() => dispatch(showModal('Delete disk', deleteModal(d)))}
                    >Delete</Button>
                  </div>
                )}
            </div>
          )}
          <div
            className="disk free"
            key={'free'}
            style={{ flexGrow: free }}
          >
            <h3>Unallocated</h3>
            <p>{free} MB</p>
            {!this.poweredOff() ? null : (
               <Button
                 onClick={() => dispatch(showModal('Add a disk', addModal))}
                 disabled={free === 0}
               >Add a disk</Button>
             )}
          </div>
        </section>
        {this.renderStatusMessage(linode.status)}
      </Card>
    );
  }
}

DiskPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
