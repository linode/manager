import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Input from 'linode-components/dist/forms/Input';
import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import PasswordInput from 'linode-components/dist/forms/PasswordInput';
import Select from 'linode-components/dist/forms/Select';
import { onChange } from 'linode-components/dist/forms/utilities';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { DistributionSelect } from '~/linodes/components';
import isEmpty from 'lodash/isEmpty';

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

  componentDidMount() {
    import('zxcvbn')
      .then((zxcvbn) => {
        this.passwordStrengthCalculator = (v) => isEmpty(v) ? null : zxcvbn(v).score;
      });
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
    const passwordStrength = this.passwordStrengthCalculator
      && this.passwordStrengthCalculator(password);

    let minimumStorageSize = 8;
    if (images[image]) {
      minimumStorageSize = images[image].size;
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
                strength={passwordStrength}
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
