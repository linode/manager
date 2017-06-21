import _ from 'lodash';
import React, { Component, PropTypes } from 'react';

import { CancelButton } from 'linode-components/buttons';
import {
  Form,
  FormSummary,
  Input,
  ModalFormGroup,
  PasswordInput,
  Select,
  SubmitButton,
} from 'linode-components/forms';

import { hideModal } from '~/actions/modal';
import { linodes } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { TrackEvent } from '~/actions/trackEvent.js';


export class AddModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      errors: {},
      label: '',
      size: props.free,
      distribution: '',
      password: '',
      filesystem: 'ext4',
    };
  }

  onSubmit = () => {
    const { dispatch, linode, title } = this.props;
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
      () => TrackEvent('Modal', 'add', title),
      hideModal,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { dispatch, free, distributions, title } = this.props;
    const { label, size, distribution, filesystem, password, loading, errors } = this.state;

    const vendors = _.sortBy(
      _.map(
        _.groupBy(Object.values(distributions.distributions), d => d.vendor),
        (v, k) => ({
          name: k,
          versions: _.orderBy(v, ['recommended', 'created'], ['desc', 'desc']),
        })
      ), vendor => vendor.name);

    const distributionOptions = [{ value: '', label: 'None' }];
    for (let i = 0; i < vendors.length; ++i) {
      const v = vendors[i];
      if (i !== 0) {
        distributionOptions.push({ value: v.name, disabled: 'disabled', label: '──────────' });
      }
      v.versions.forEach(d =>
        distributionOptions.push({ value: d.id, label: d.label }));
    }

    const minimumStorageSize = () =>
      distributions.distributions[distribution].minimum_storage_size;

    return (
      <Form onSubmit={this.onSubmit}>
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
          <Select
            id="distribution"
            name="distribution"
            value={distribution}
            options={distributionOptions}
            onChange={this.onChange}
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
            >
              <option value="ext3">ext3</option>
              <option value="ext4">ext4</option>
              <option value="swap">swap</option>
              <option value="raw">raw</option>
            </Select>
          </ModalFormGroup>
        )}
        <ModalFormGroup id="size" label="Size" apiKey="size" errors={errors}>
          <Input
            id="size"
            name="size"
            value={size}
            type="number"
            min={distribution ? minimumStorageSize() : 8}
            max={free}
            onChange={this.onChange}
            label="MB"
          />
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton
            onClick={() => {
              TrackEvent('Modal', 'cancel', title);
              dispatch(hideModal());
            }}
          />
          <SubmitButton
            disabled={loading}
            disabledChildren="Adding Disk"
          >Add Disk</SubmitButton>
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

AddModal.propTypes = {
  distributions: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  free: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
