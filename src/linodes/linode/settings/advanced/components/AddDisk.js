import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Input, ModalFormGroup, PasswordInput, Select } from 'linode-components';
import { onChange } from 'linode-components';
import { FormModalBody } from 'linode-components';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { DistributionSelect } from '~/linodes/components';


export default class AddDisk extends Component {
  static title = 'Add a Disk'

  static trigger(dispatch, linode, images, free) {
    return dispatch(showModal(AddDisk.title, (
      <AddDisk
        dispatch={dispatch}
        images={images}
        linode={linode}
        free={free}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      label: '',
      size: props.free,
      image: '',
      password: '',
      filesystem: 'ext4',
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { label, size, image, password, filesystem } = this.state;
    const data = {
      label,
      filesystem,
      size: parseInt(size),
      image,
      root_pass: password || null,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.linodes.disks.post(data, linode.id),
      hideModal,
    ]));
  }

  render() {
    const { dispatch, free, images } = this.props;
    const { label, size, image, filesystem, password, errors } = this.state;

    let minimumStorageSize = 8;
    if (images[image]) {
      minimumStorageSize = images[image].min_deploy_size;
    }

    const filesystemOptions = [
      { value: 'ext3', label: 'ext3' },
      { value: 'ext4', label: 'ext4' },
      { value: 'swap', label: 'swap' },
      { value: 'raw', label: 'raw' },
    ];

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={() => dispatch(hideModal())}
        buttonText="Add Disk"
        buttonDisabledText="Adding Disk"
        analytics={{ title: AddDisk.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup id="label" label="Label" apiKey="label" errors={errors}>
            <Input
              id="label"
              name="label"
              placeholder="Label"
              value={label}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup
            id="image"
            label="Image"
            apiKey="image"
            errors={errors}
          >
            <DistributionSelect
              id="image"
              name="image"
              value={image}
              images={images}
              onChange={this.onChange}
              allowNone
            />
          </ModalFormGroup>
          {image ? (
            <ModalFormGroup id="password" label="Root Password" apiKey="root_pass" errors={errors}>
              <PasswordInput
                name="password"
                id="password"
                value={password}
                onChange={this.onChange}
              />
            </ModalFormGroup>
          ) : (
            <ModalFormGroup id="filesystem" label="Filesystem" apiKey="filesystem" errors={errors}>
              <Select
                id="filesystem"
                name="filesystem"
                value={filesystem}
                onChange={this.onChange}
                options={filesystemOptions}
              />
            </ModalFormGroup>
          )}
          <ModalFormGroup id="size" label="Size" apiKey="size" errors={errors}>
            <Input
              id="size"
              name="size"
              value={size}
              type="number"
              min={minimumStorageSize}
              max={free}
              onChange={this.onChange}
              label="MB"
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddDisk.propTypes = {
  images: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  free: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};
