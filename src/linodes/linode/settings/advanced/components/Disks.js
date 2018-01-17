import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { PrimaryButton } from 'linode-components';
import { DeleteModalBody } from 'linode-components';
import { Card, CardHeader } from 'linode-components';
import { Dropdown } from 'linode-components';
import { Input } from 'linode-components';
import { List } from 'linode-components';
import { ListBody } from 'linode-components';
import { MassEditControl } from 'linode-components';
import { ListHeader } from 'linode-components';
import { Table } from 'linode-components';
import { CheckboxCell, LabelCell, TableCell } from 'linode-components';

import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { PortalModal } from '~/components/modal';
import { hideModal, deleteModalProps } from '~/utilities';

import AddDisk from './AddDisk';
import EditDisk from './EditDisk';
import { AddImage } from '~/images/components';


export default class Disks extends Component {
  static OBJECT_TYPE = 'linode-disks'

  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      modal: null,
    };

    this.hideModal = hideModal.bind(this);
  }

  freeSpace() {
    const { linode, type } = this.props;
    const disks = Object.values(linode._disks.disks);
    const total = type.disk;
    const used = disks.reduce((total, disk) => total + disk.size, 0);
    return total - used;
  }

  poweredOff() {
    return ['offline', 'provisioning'].indexOf(this.props.linode.status) !== -1;
  }

  deleteDisksModal = (disks) => {
    const { dispatch, linode } = this.props;
    const del = (id) => api.linodes.disks.delete(linode.id, id);
    this.setState({
      modal: {
        ...deleteModalProps(
          dispatch, disks, del,
          'Disk', Disks.OBJECT_TYPE, this.hideModal),
        name: 'massDeleteDisk',
      },
    });
  };

  addImageModal = (linode, disk) => {
    this.setState({
      modal: {
        name: 'addImage',
        title: AddImage.title,
        linode,
        disk,
      },
    });
  }

  addDiskModal = (linode, images, free) => {
    this.setState({
      modal: {
        name: 'addDisk',
        title: AddDisk.title,
        linode,
        images,
        free,
      },
    });
  }

  editDiskModal = (linode, disk, free) => {
    this.setState({
      modal: {
        name: 'editDisk',
        title: EditDisk.title,
        linode,
        disk,
        free,
      },
    });
  }

  renderModal = () => {
    const { dispatch } = this.props;
    if (!this.state.modal) {
      return null;
    }
    const { name, title, free, linode, disk, images } = this.state.modal;
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'addDisk') &&
          <AddDisk
            dispatch={dispatch}
            images={images}
            linode={linode}
            free={free}
            close={this.hideModal}
          />
        }
        {(name === 'editDisk') &&
          <EditDisk
            dispatch={dispatch}
            free={free}
            linode={linode}
            disk={disk}
            close={this.hideModal}
          />
        }
        {(name === 'addImage') &&
          <AddImage
            dispatch={dispatch}
            linode={linode}
            disk={disk}
            title={AddImage.title}
            close={this.hideModal}
          />
        }
        {(name === 'massDeleteDisk') &&
          <DeleteModalBody
            {...this.state.modal}
          />
        }
      </PortalModal>
    );
  }

  renderDiskActions = ({ column, record }) => {
    const { linode } = this.props;
    const free = this.freeSpace();

    const groups = [
      { elements: [{ name: 'Edit', action: () =>
        this.editDiskModal(linode, record, free) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteDisksModal([record]) }] },
    ];

    if (record.filesystem !== 'swap') {
      groups.splice(1, 0, { elements: [{
        name: 'Create an Image',
        action: () => this.addImageModal(linode, record),
      }] });
    }

    return (
      <TableCell column={column} record={record} className="ActionsCell">
        <Dropdown
          groups={groups}
          analytics={{ title: 'Disk actions' }}
        />
      </TableCell>
    );
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
    const { dispatch, linode, images, selectedMap } = this.props;
    const { filter } = this.state;
    const disks = Object.values(linode._disks.disks);
    const free = this.freeSpace();

    const { sorted } = transform(disks, {
      filterBy: filter,
    });

    const nav = (
      <PrimaryButton
        className="float-right"
        buttonClass="btn-default"
        onClick={() => this.addDiskModal(linode, images, free)}
        disabled={free === 0}
      >
        Add a Disk
      </PrimaryButton>
    );

    const header = <CardHeader title="Disks" nav={nav} />;

    return (
      <Card header={header}>
        {this.renderModal()}
        <List>
          <ListHeader className="Menu">
            <div className="Menu-item">
              <MassEditControl
                data={sorted}
                dispatch={dispatch}
                massEditGroups={[{ elements: [
                  { name: 'Delete', action: this.deleteDisksModal },
                ] }]}
                selectedMap={selectedMap}
                objectType={Disks.OBJECT_TYPE}
                toggleSelected={toggleSelected}
              />
            </div>
            <div className="Menu-item">
              <Input
                placeholder="Filter..."
                onChange={({ target: { value } }) => this.setState({ filter: value })}
                value={this.state.filter}
              />
            </div>
          </ListHeader>
          <ListBody>
            <Table
              className="Table--secondary"
              columns={[
                { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
                {
                  cellComponent: LabelCell,
                  dataKey: 'label',
                  label: 'Label',
                  titleKey: 'label',
                  tooltipEnabled: true,
                },
                { dataKey: 'size', label: 'Size', formatFn: (s) => `${s} MB` },
                { cellComponent: this.renderDiskActions },
              ]}
              data={sorted}
              noDataMessage="You have no disks."
              selectedMap={selectedMap}
              onToggleSelect={(record) => {
                dispatch(toggleSelected(Disks.OBJECT_TYPE, record.id));
              }}
            />
          </ListBody>
        </List>
      </Card>
    );
  }
}

Disks.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  type: PropTypes.object.isRequired,
  images: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};
