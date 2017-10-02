import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import { LinkButton } from 'linode-components/buttons';
import { Dropdown } from 'linode-components/dropdowns';
import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { ListHeader } from 'linode-components/lists/headers';
import { MassEditControl } from 'linode-components/lists/controls';
import { Table } from 'linode-components/tables';
import { CheckboxCell, LabelCell, TableCell } from 'linode-components/tables/cells';

import { default as toggleSelected } from '~/actions/select';
import { volumes } from '~/api';
import { actions as linodeActions } from '~/api/configs/linodes';
import { detachVolume } from '~/api/volumes';

import { transform } from '~/api/util';
import { RegionCell } from '~/components/tables/cells';
import { confirmThenDelete } from '~/utilities';

import AddEditVolume from './AddEditVolume';
import MoreInfo from './MoreInfo';
import AttachVolume from './AttachVolume';
import ResizeVolume from './ResizeVolume';


export default class VolumesList extends Component {
  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  removeFromLinodeAndCall(action) {
    return id => async (dispatch, getState) => {
      let volumeOnLinode = getState().api.volumes.volumes[id];
      await dispatch(action(id));

      try {
        let linodeId;

        if (!volumeOnLinode) {
          Object.values(getState().api.linodes.linodes).forEach(l => {
            const [volume] = _.filter(Object.values(l._volumes.volumes), v => v.id === id);
            if (volume) {
              volumeOnLinode = volume;
              linodeId = volume.linode_id;
            }
          });
        } else {
          linodeId = volumeOnLinode.linode_id;
        }

        if (linodeId) {
          return dispatch(linodeActions.volumes.delete(linodeId, volumeOnLinode.id));
        }
      } catch (e) {
        // Pass
      }
    };
  }

  deleteVolumes = confirmThenDelete(
    this.props.dispatch,
    'volume',
    this.removeFromLinodeAndCall(volumes.delete),
    this.props.objectType).bind(this)

  detachVolumes = confirmThenDelete(
    this.props.dispatch,
    'volume',
    this.removeFromLinodeAndCall(detachVolume),
    this.props.objectType,
    undefined,
    'detach',
    'detaching').bind(this)

  renderVolumeActions = ({ column, record }) => {
    const { dispatch, linodes } = this.props;

    const groups = [
      { elements: [{ name: 'More Info', action: () => MoreInfo.trigger(dispatch, record) }] },
      { elements: [
        { name: 'Edit', action: () =>
          AddEditVolume.trigger(dispatch, linodes, record) },
        { name: 'Resize',
          action: () => ResizeVolume.trigger(dispatch, record) },
        record.linode_id === null ?
        { name: 'Attach', action: () =>
          AttachVolume.trigger(dispatch, linodes, record) } :
        { name: 'Detach', action: () => this.detachVolumes(record) },
      ] },
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

  renderAttached = ({ column, record }) => {
    const { linodes } = this.props;
    const { linode_id: linodeId } = record;

    let contents = <span>Unattached</span>;
    let to = linodeId;

    if (to) {
      const linode = linodes[linodeId];
      if (linode && linode.label) {
        to = (
          <LinkButton to={`/linodes/${linode.label}/settings/advanced`}>
            {linode.label}
          </LinkButton>
        );
      }

      contents = <div>Attached to {to}</div>;
    }

    return (
      <TableCell column={column} record={record}>
        {contents}
      </TableCell>
    );
  }

  render() {
    const { dispatch, selectedMap, volumes, objectType, className } = this.props;
    const { filter } = this.state;

    const { sorted } = transform(volumes, {
      filterBy: filter,
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
                label: 'Label',
                dataKey: 'label',
                titleKey: 'label',
                tooltipEnabled: true,
              },
              {
                label: 'Size',
                dataFn: (volume) => {
                  const { size } = volume;
                  return `${size} GiB`;
                } },
              {
                cellComponent: RegionCell,
                headerClassName: 'RegionColumn',
                label: 'Region',
              },
              {
                cellComponent: this.renderAttached,
                className: 'AttachedCell',
                label: 'Attached',
              },
              {
                cellComponent: this.renderVolumeActions,
                headerClassName: 'ActionsColumn',
              },
            ]}
            data={sorted}
            selectedMap={selectedMap}
            disableHeader={!className}
            onToggleSelect={(record) => {
              dispatch(toggleSelected(objectType, record.id));
            }}
            className={className}
            noDataMessage="No Volumes found."
          />
        </ListBody>
      </List>
    );
  }
}

VolumesList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  objectType: PropTypes.string.isRequired,
  selectedMap: PropTypes.object.isRequired,
  volumes: PropTypes.object.isRequired,
  className: PropTypes.string,
  linodes: PropTypes.object,
};
