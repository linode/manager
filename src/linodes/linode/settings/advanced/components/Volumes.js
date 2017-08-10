import React, { Component, PropTypes } from 'react';

import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { Dropdown } from 'linode-components/dropdowns';
import { DeleteModalBody } from 'linode-components/modals';

import { linodes } from '~/api';
import { RegionCell } from '~/components/tables/cells';
import { AddEditVolume, VolumesList } from '~/linodes/volumes/components';


export default function Volumes(props) {
  const { dispatch, linode, distributions, selectedMap } = props;
  const volumes = Object.values(linode._volumes.volumes);

  const nav = (
    <PrimaryButton
      className="float-right"
      buttonClass="btn-default"
      onClick={() => AddEditVolume.trigger(dispatch, linode)}
    >
      Add a Volume
    </PrimaryButton>
  );

  const header = <CardHeader title="Volumes" nav={nav} />;

  return (
    <Card header={header}>
      <VolumesList
        objectType={Volumes.OBJECT_TYPE}
        volumes={volumes}
        selectedMap={selectedMap}
        dispatch={dispatch}
        className="Table--secondary"
      />
    </Card>
  );
}

Volumes.OBJECT_TYPE = 'linode-volumes';

Volumes.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  distributions: PropTypes.object.isRequired,
};
