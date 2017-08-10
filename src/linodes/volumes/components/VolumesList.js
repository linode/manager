import React, { Component, PropTypes } from 'react';

import { Dropdown } from 'linode-components/dropdowns';
import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { ListHeader } from 'linode-components/lists/headers';
import { DeleteModalBody } from 'linode-components/modals';
import { MassEditControl } from 'linode-components/lists/controls';
import { Table } from 'linode-components/tables';
import {
  ButtonCell,
  CheckboxCell,
  LabelCell,
  TableCell,
} from 'linode-components/tables/cells';

import { showModal, hideModal } from '~/actions/modal';
import { default as toggleSelected } from '~/actions/select';
import { transform } from '~/api/util';
import { RegionCell } from '~/components/tables/cells';

import AddEditVolume from './AddEditVolume';
import MoreInfo from './MoreInfo';


export default class VolumesList extends Component {
  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  deleteVolumes = (volumesToDelete) => {
    const { dispatch, objectType } = this.props;
    const volumesArr = Array.isArray(volumesToDelete) ? volumesToDelete : [volumesToDelete];

    const selectedVolumes = volumesArr.map(l => l.label);

    dispatch(showModal('Delete Volume(s)', (
      <DeleteModalBody
        onSubmit={async () => {
          const ids = volumesArr.map(function (volume) { return volume.id; });

          await Promise.all(ids.map(id => dispatch(volumes.delete(id))));
          dispatch(toggleSelected(objectType, ids));
          dispatch(hideModal());
        }}
        items={selectedVolumes}
        typeOfItem="Volumes"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  }

  renderVolumeActions = ({ column, record }) => {
    const { dispatch, linode, plans } = this.props;

    const groups = [
      { elements: [{ name: 'More Info', action: () => MoreInfo.trigger(dispatch, record) }] },
      { elements: [{ name: 'Edit', action: () => AddEditVolume.trigger(dispatch, linode, undefined, record) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteVolumes(record) }] },
    ];

    return (
      <TableCell column={column} record={record} className="ActionsCell">
        <Dropdown
          groups={groups}
          analytics={{ title: 'Volume actions' }}
        />
      </TableCell>
    );
  }

  render() {
    const { dispatch, selectedMap, volumes, objectType, className } = this.props;
    const { filter } = this.state;

    const { sorted } = transform(volumes, {
      filterBy: filter,
      sortBy: v => v.label.toLowerCase(),
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sorted}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteVolumes },
              ] }]}
              selectedMap={selectedMap}
              objectType={objectType}
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
            columns={[
              { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
              {
                cellComponent: LabelCell,
                headerClassName: 'LabelColumn',
                label: className ? 'Label' : undefined,
                dataKey: 'label',
                titleKey: 'label',
                tooltipEnabled: true,
              },
              {
                label: className ? 'Size' : undefined,
                dataFn: (volume) => {
                  const { size } = volume;
                  return `${size} GiB`;
                } },
              {
                cellComponent: RegionCell,
                headerClassName: 'RegionColumn',
                label: className ? 'Region' : undefined,
              },
              {
                label: className ? 'Attached' : undefined,
                dataFn: (volume) => {
                  const { linode_id: linodeId } = volume;
                  if (!linodeId) {
                    return 'Unattached';
                  }
                  return `Attached to ${linodeId}`;
              } },
              {
                cellComponent: this.renderVolumeActions,
                headerClassName: 'ActionsColumn',
              },
            ]}
            data={sorted}
            selectedMap={selectedMap}
            disableHeader
            onToggleSelect={(record) => {
              dispatch(toggleSelected(OBJECT_TYPE, record.id));
            }}
            className={this.props.className}
          />
        </ListBody>
      </List>
    );
  }
}
