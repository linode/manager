import omitBy from 'lodash/omitBy';
import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';

import AddEditVolume from '~/volumes/components/AddEditVolume';
import VolumesList from '~/volumes/components/VolumesList';


export default function Volumes(props) {
  const { dispatch, linode, selectedMap, linodes } = props;
  // Hack because the API is currently returning deleted volumes.
  const volumes = omitBy(Object.values(linode._volumes.volumes), v => v.status === 'deleted');

  const nav = (
    <PrimaryButton
      className="float-right"
      buttonClass="btn-default"
      onClick={() => AddEditVolume.trigger(dispatch, linodes, undefined, linode.id)}
    >
      Add a Volume
    </PrimaryButton>
  );

  const header = <CardHeader title="Volumes" nav={nav} />;

  return (
    <Card header={header}>
      <VolumesList
        objectType={Volumes.OBJECT_TYPE}
        linodes={linodes}
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
  selectedMap: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
};
