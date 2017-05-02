import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { linodes } from '~/api';

import { showModal } from '~/actions/modal';
import { EditModal } from './EditModal';
import { DeleteModal } from './DeleteModal';
import { AddModal } from './AddModal';
import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';

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

function select(state) {
  return { distributions: state.api.distributions };
}

const AddModalRedux = connect(select)(AddModal);

export class DiskPanel extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);
    await dispatch(linodes.disks.all([id]));
  }

  renderStatusMessage(status) {
    if (status !== 'offline' && status !== 'provisioning') {
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
    const { dispatch, linode } = this.props;
    const disks = Object.values(linode._disks.disks);
    const total = linode.type.storage;
    const used = disks.reduce((total, disk) => total + disk.size, 0);
    const free = total - used;
    const poweredOff = linode.status === 'offline';

    const addModal = <AddModalRedux free={free} linode={linode} />;

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
        {this.renderStatusMessage(linode.status)}
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
                {!poweredOff || d.state === 'deleting' ? null : (
                  <div>
                    <Button
                      className="LinodesLinodeSettingsComponentsDiskPanel-edit"
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
          {free <= 0 ? null : (
            <div
              className="disk free"
              key={'free'}
              style={{ flexGrow: free }}
            >
              <h3>Unallocated</h3>
              <p>{free} MB</p>
              {!poweredOff ? null : (
                <Button
                  onClick={() => dispatch(showModal('Add a disk', addModal))}
                  className="LinodesLinodeSettingsComponentsDiskPanel-add"
                >Add a disk</Button>
              )}
            </div>
           )}
        </section>
      </Card>
    );
  }
}

DiskPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
