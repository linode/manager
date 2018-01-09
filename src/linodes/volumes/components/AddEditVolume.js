import pickBy from 'lodash/pickBy';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router';

import { Input, ModalFormGroup, Select } from 'linode-components';
import { onChange } from 'linode-components';
import { FormModalBody } from 'linode-components';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
import { actions as linodeActions } from '~/api/generic/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import { RegionSelect } from '~/components';
import { AVAILABLE_VOLUME_REGIONS } from '~/constants';
import LinodeSelect from '~/linodes/components/LinodeSelect';


export default class AddEditVolume extends Component {
  static trigger(dispatch, linodes, volume, linode) {
    const title = volume ? 'Edit Volume' : 'Add a Volume';
    return dispatch(showModal(title, (
      <AddEditVolume
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        linodes={linodes}
        volume={volume}
        title={title}
        linode={linode}
      />
    )));
  }

  constructor(props) {
    super(props);
    const { volume = {}, linode, linodes } = props;

    this.state = {
      linode,
      linodes,
      config: null,
      errors: {},
      label: volume.label || '',
      size: volume.size || 20,
      allConfigs: {},
      configs: false,
    };

    this.onChange = onChange.bind(this);
  }

  async componentDidMount() {
    const { linode: linodeId } = this.props;
    this.fetchLinodeConfigs(linodeId);
  }

  onRegionChange = async (e) => {
    this.onChange(e);
    this.setState({
      linode: null,
      config: null,
    });
  }

  onLinodeChange = async (e) => {
    const { allConfigs } = this.state;
    const linodeId = e.target.value;

    this.onChange(e);

    if (linodeId === LinodeSelect.EMPTY) {
      return;
    }

    if (!allConfigs[linodeId]) {
      this.fetchLinodeConfigs(linodeId);
    }
  }

  onSubmit = () => {
    const { dispatch, close, volume: { id } = {} } = this.props;
    const { label, region, size, linode, config } = this.state;
    const data = id ? { label } : {
      label,
      region,
      size: +size,
      linode_id: linode === LinodeSelect.EMPTY ? undefined : +linode,
      config_id: +config,
    };

    if (!data.linode_id) {
      delete data.linode_id;
    }

    if (!data.config_id) {
      delete data.config_id;
    }


    const actions = [
      () => api.volumes[id ? 'put' : 'post'](data, ...[id].filter(Boolean)),
      (volume) => volume && data.linode_id && linodeActions.volumes.one(volume, linode, volume.id),
      close,
    ];

    return dispatch(dispatchOrStoreErrors.call(this, actions));
  }

  fetchLinodeConfigs = async (linodeId) => {
    const { allConfigs } = this.state;
    const configs = await this.props.dispatch(api.linodes.configs.all([linodeId]));
    const linodeConfigs = Object.values(configs.data).map(function (config) {
      return {
        label: config.label,
        value: parseInt(config.id),
      };
    });

    this.setState({
      config: undefined,
      allConfigs: { ...allConfigs, [linodeId]: linodeConfigs },
    });
  }

  render() {
    const { close, title, volume, linode: original } = this.props;
    const {
      errors,
      region,
      label,
      size,
      linode,
      linodes,
      allConfigs,
      config,
    } = this.state;

    const configs = allConfigs[linode] || [];

    const newVolumeOnLinode = !volume && original;
    const showLinodeAndRegion = !volume && !original;
    const existingVolume = !!volume;
    const showLinodeConfigs = !existingVolume && (configs.length > 1);

    const filteredLinodes = pickBy(linodes,
      linode => linode.region === region
    );

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText={volume ? undefined : 'Add Volume'}
        buttonDisabledText={volume ? undefined : 'Adding Volume'}
        analytics={{ title, action: 'add' }}
        errors={errors}
      >
        <div>
          {!newVolumeOnLinode ? null : (
            <p>
              Your new volume will be attached to this Linode. If you'd like
              to create an unattached volume or attach it to another Linode or
              create it in another region, click <Link to="/volumes">here</Link>.
            </p>
          )}
          <ModalFormGroup label="Label" id="label" apiKey="label" errors={errors}>
            <Input
              placeholder="my-volume"
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          {!showLinodeAndRegion ? null : (
            <ModalFormGroup label="Region" id="region" apiKey="region" errors={errors}>
              <RegionSelect
                filter={AVAILABLE_VOLUME_REGIONS}
                value={region}
                name="region"
                id="region"
                onChange={this.onRegionChange}
              />
            </ModalFormGroup>
          )}
          {existingVolume ? null : (
            <ModalFormGroup label="Size" id="size" apiKey="size" errors={errors}>
              <Input
                placeholder="20"
                value={size}
                name="size"
                id="size"
                onChange={this.onChange}
                type="number"
                min={0}
                label="GiB"
              />
            </ModalFormGroup>
          )}
          {!showLinodeAndRegion ? null : (
            <div>
              <h3>Attach To</h3>
              <ModalFormGroup label="Linode" id="linode" apiKey="linode_id" errors={errors}>
                <LinodeSelect
                  linodes={filteredLinodes}
                  value={linode}
                  name="linode"
                  id="linode"
                  onChange={this.onLinodeChange}
                  allowNone
                />
              </ModalFormGroup>
            </div>
          )}
          {!showLinodeConfigs ? null :
            <ModalFormGroup label="Config" id="config" apiKey="config_id" errors={errors}>
              <Select
                options={configs}
                value={config}
                name="config"
                onChange={this.onChange}
              />
            </ModalFormGroup>
          }
        </div>
      </FormModalBody>
    );
  }
}

AddEditVolume.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  volume: PropTypes.object,
  linode: PropTypes.object,
};
