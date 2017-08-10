import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { volumes } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { RegionSelect } from '~/components';


export default class AddEditVolume extends Component {
  static trigger(dispatch, linodes, plans, volume) {
    const title = volume ? 'Edit Volume' : 'Add a Volume';
    return dispatch(showModal(title, (
      <AddEditVolume
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        linodes={linodes}
        plans={plans}
        volume={volume}
        title={title}
      />
    )));
  }

  constructor(props) {
    super(props);

    const { volume = {} } = props;

    this.state = {
      errors: {},
      label: volume.label || '',
      size: volume.size || 10,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, close } = this.props;
    const { label, region, size } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => volumes.post({ label, region, size }),
      close,
    ]));
  }

  render() {
    const { close, title, volume } = this.props;
    const { errors, region, label, size } = this.state;

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
          <ModalFormGroup label="Label" id="label" apiKey="label" errors={errors}>
            <Input
              placeholder="my-volume"
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          {volume ? null : (
            <ModalFormGroup label="Region" id="region" apiKey="region" errors={errors}>
              <RegionSelect
                value={region}
                name="region"
                id="region"
                onChange={this.onChange}
              />
            </ModalFormGroup>
          )}
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
              disabled={/* TODO: undisable this once API support for resizing works */volume}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddEditVolume.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  plans: PropTypes.object,
  volume: PropTypes.object,
};
