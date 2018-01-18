import PropTypes from 'prop-types';
import React, { Component } from 'react';

import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import Dropdown from 'linode-components/dist/dropdowns/Dropdown';
import Input from 'linode-components/dist/forms/Input';
import List from 'linode-components/dist/lists/List';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import MassEditControl from 'linode-components/dist/lists/controls/MassEditControl';
import ListHeader from 'linode-components/dist/lists/headers/ListHeader';
import Table from 'linode-components/dist/tables/Table';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';
import LabelCell from 'linode-components/dist/tables/cells/LabelCell';
import TableCell from 'linode-components/dist/tables/cells/TableCell';

import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { confirmThenDelete } from '~/utilities';

import AddDisk from './AddDisk';
import EditDisk from './EditDisk';
import { AddImage } from '~/images/components';


export default class Disks extends Component {
  static OBJECT_TYPE = 'linode-disks'

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  deleteDisks = confirmThenDelete(
    this.props.dispatch,
    'disk',
    (id) => api.linodes.disks.delete(this.props.linode.id, id),
    Disks.OBJECT_TYPE).bind(this)

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

  renderDiskActions = ({ column, record }) => {
    const { dispatch, linode } = this.props;
    const free = this.freeSpace();

    const groups = [
      { elements: [{ name: 'Edit', action: () =>
        EditDisk.trigger(dispatch, linode, record, free) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteDisks(record) }] },
    ];

    if (record.filesystem !== 'swap') {
      groups.splice(1, 0, { elements: [{
        name: 'Create an Image',
        action: () => AddImage.trigger(dispatch, undefined, linode, record),
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
        onClick={() => AddDisk.trigger(dispatch, linode, images, free)}
        disabled={free === 0}
      >
        Add a Disk
      </PrimaryButton>
    );

    const header = <CardHeader title="Disks" nav={nav} />;

    return (
      <Card header={header}>
        <List>
          <ListHeader className="Menu">
            <div className="Menu-item">
              <MassEditControl
                data={sorted}
                dispatch={dispatch}
                massEditGroups={[{ elements: [
                  { name: 'Delete', action: this.deleteDisks },
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
