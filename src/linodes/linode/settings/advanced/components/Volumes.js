import React, { Component, PropTypes } from 'react';

import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { Dropdown } from 'linode-components/dropdowns';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { LabelCell, TableCell } from 'linode-components/tables/cells';

import { hideModal, showModal } from '~/actions/modal';
import { linodes } from '~/api';
import { RegionCell } from '~/components/tables/cells';


function VolumeActions(props) {
  const { dispatch, linode, volume } = props;

  const groups = [
    { elements: [{ name: 'More Info', action: () => MoreInfo.trigger(dispatch, volume) }] },
    { elements: [{ name: 'Edit', action: () => EditVolume.trigger(dispatch, linode, volume) }] },
    { elements: [{ name: 'Delete', action: () => DeleteVolume.trigger(dispatch, volume) }] },
  ];

  return (
    <Dropdown
      groups={groups}
      analytics={{ title: 'Volume actions' }}
    />
  );
}

export default class Volumes extends Component {
  renderVolumeActions = ({ column, record }) => {
    const { dispatch, linode } = this.props;

    return (
      <TableCell column={column} record={record}>
        <VolumeActions linode={linode} volume={record} />
      </TableCell>
    );
  }

  render() {
    const { dispatch, linode, distributions } = this.props;
    const volumes = Object.values(linode._volumes.volumes);

    const nav = (
      <PrimaryButton
        className="float-right"
        buttonClass="btn-default"
        onClick={() => AddVolume.trigger(dispatch, linode)}
      >
        Add a Volume
      </PrimaryButton>
    );

    const header = <CardHeader title="Volumes" nav={nav} />;

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
            { dataKey: 'size', label: 'Size', formatFn: (s) => `${s} GB` },
            {
              cellComponent: RegionCell,
              headerClassName: 'RegionColumn',
            },
            {
              cellComponent: this.renderVolumeActions,
              headerClassName: 'VolumeActionColumn',
            },
          ]}
          data={volumes}
          noDataMessage="You have no volumes."
        />
      </Card>
    );
  }
}

Volumes.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  distributions: PropTypes.object.isRequired,
};
