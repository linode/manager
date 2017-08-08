import React, { Component, PropTypes } from 'react';

import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { LabelCell, ButtonCell } from 'linode-components/tables/cells';

import { hideModal, showModal } from '~/actions/modal';
import { linodes } from '~/api';


export default class Volumes extends Component {
  render() {
    const { dispatch, linode, distributions } = this.props;
    const volumes = Object.values(linode._volumes.volumes);

    const nav = (
      <PrimaryButton
        className="float-sm-right"
        buttonClass="btn-default"
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
              cellComponent: ButtonCell,
              headerClassName: 'ButtonColumn',
              onClick: (volume) => { this.deleteVolume(linode, volume); },
              text: 'Delete',
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
