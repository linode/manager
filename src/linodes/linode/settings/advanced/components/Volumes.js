import omitBy from 'lodash/omitBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { PrimaryButton } from 'linode-components';
import { Card, CardHeader } from 'linode-components';

import { PortalModal } from '~/components/modal';
import AddEditVolume from '~/volumes/components/AddEditVolume';
import VolumesList from '~/volumes/components/VolumesList';
import { hideModal } from '~/utilities';


export default class Volumes extends Component {
  static OBJECT_TYPE = 'linode-volumes';

  constructor(props) {
    super(props);

    this.state = { modal: null };

    this.hideModal = hideModal.bind(this);
  }

  addEditVolumeModal = () => {
    this.setState({
      modal: {
        name: 'addEditVolume',
        title: AddEditVolume.title,
      },
    });
  }

  renderModal = () => {
    const { dispatch, linodes, linode } = this.props;
    if (!this.state.modal) {
      return null;
    }
    const { name, title } = this.state.modal;
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'addEditVolume') &&
          <AddEditVolume
            dispatch={dispatch}
            close={this.hideModal}
            linodes={linodes}
            linode={linode.id}
          />
        }
      </PortalModal>
    );
  }

  render() {
    const { dispatch, linode, selectedMap, linodes } = this.props;
    // Hack because the API is currently returning deleted volumes.
    const volumes = omitBy(Object.values(linode._volumes.volumes), v => v.status === 'deleted');

    const nav = (
      <PrimaryButton
        className="float-right"
        buttonClass="btn-default"
        onClick={() => this.addEditVolumeModal()}
      >
        Add a Volume
      </PrimaryButton>
    );

    const header = <CardHeader title="Volumes" nav={nav} />;

    return (
      <Card header={header}>
        {this.renderModal()}
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
}

Volumes.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
  linodes: PropTypes.object.isRequired,
};
