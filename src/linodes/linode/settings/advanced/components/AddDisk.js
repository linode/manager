import React, { Component, PropTypes } from 'react';

import { Input, ModalFormGroup, PasswordInput, Select } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { linodes } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { DistributionSelect } from '~/linodes/components';


export default class AddDisk extends Component {
  static title = 'Add a Disk'

  static trigger(dispatch, linode, distributions, free) {
    return dispatch(showModal(AddDisk.title, (
      <AddDisk
        dispatch={dispatch}
        distributions={distributions}
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
      distribution: '',
      password: '',
      filesystem: 'ext4',
    };
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;
    const { label, size, distribution, password, filesystem } = this.state;
    const data = {
      label,
      filesystem,
      size: parseInt(size),
      distribution: distribution || null,
      root_pass: password || null,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => linodes.disks.post(data, linode.id),
      hideModal,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { dispatch, free, distributions: { distributions } } = this.props;
    const { label, size, distribution, filesystem, password, errors } = this.state;

    let minimumStorageSize = 8;
    if (distributions[distribution]) {
      minimumStorageSize = distributions[distribution].disk_minimum;
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
            id="distribution"
            label="Distribution"
            apiKey="distribution"
            errors={errors}
          >
            <DistributionSelect
              id="distribution"
              name="distribution"
              value={distribution}
              distributions={distributions}
              onChange={this.onChange}
              allowNone
            />
          </ModalFormGroup>
          {distribution ? (
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
  distributions: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  free: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};
