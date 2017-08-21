import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';

import { setAnalytics, setSource, setTitle } from '~/actions';
import { volumes, linodes } from '~/api';
import CreateHelper from '~/components/CreateHelper';

import { AddEditVolume, VolumesList } from '../components';


const OBJECT_TYPE = 'volumes';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await Promise.all([
      linodes, volumes,
    ].map(o => dispatch(o.all())));
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['volumes']));
    dispatch(setTitle('Volumes'));
  }

  render() {
    const { dispatch, linodes, volumes, selectedMap } = this.props;

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Volumes</h1>
            <PrimaryButton
              className="float-sm-right"
              onClick={() => AddEditVolume.trigger(dispatch, linodes)}
            >
              Add a Volume
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(volumes.volumes).length ?
            <VolumesList
              objectType={OBJECT_TYPE}
              volumes={volumes.volumes}
              selectedMap={selectedMap}
              dispatch={dispatch}
              linodes={linodes}
            /> :
            <CreateHelper
              label="Volumes"
              onClick={() => {}}
              linkText="Add a Volume"
            />
          }
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  volumes: PropTypes.object,
  linodes: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  return {
    volumes: state.api.volumes,
    linodes: state.api.linodes.linodes,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
