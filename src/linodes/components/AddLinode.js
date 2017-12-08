import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import { Input, ModalFormGroup, PasswordInput } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { RegionSelect } from '~/components';

import BackupsCheckbox from './BackupsCheckbox';
import DistributionSelect from './DistributionSelect';
import PlanSelect from './PlanSelect';


export default class AddLinode extends Component {
  static title = 'Add a Linode'

  static trigger(dispatch, images, plans) {
    return dispatch(showModal(AddLinode.title, (
      <AddLinode
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        images={images}
        plans={plans}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {}, password: '' };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { label, image, region, plan, backups, password } = this.state;

    const data = {
      label,
      image,
      region,
      type: plan,
      backups_enabled: backups,
      root_pass: password,
    };

    if (image === 'none') {
      delete data.root_pass;
      delete data.image;
    }

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.linodes.post(data),
      ({ label }) => push(`/linodes/${label}`),
    ]));
  }

  render() {
    const { close, images, plans } = this.props;
    const { errors, label, image, region, plan, backups, password } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Add Linode"
        buttonDisabledText="Adding Linode"
        analytics={{ title: AddLinode.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup label="Label" id="label" apiKey="label" errors={errors}>
            <Input
              placeholder="my-linode"
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup
            label="Image"
            id="image"
            apiKey="image"
            errors={errors}
          >
            <DistributionSelect
              images={images}
              value={image}
              name="image"
              id="image"
              onChange={this.onChange}
              allowNone
            />
          </ModalFormGroup>
          <ModalFormGroup label="Region" id="region" apiKey="region" errors={errors}>
            <RegionSelect
              value={region}
              name="region"
              id="region"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Plan" id="plan" apiKey="type" errors={errors}>
            <PlanSelect
              plans={plans}
              value={plan}
              name="plan"
              id="plan"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Password" id="password" apiKey="root_pass" errors={errors}>
            <PasswordInput
              value={password}
              name="password"
              id="password"
              onChange={this.onChange}
              disabled={image === 'none'}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Backups" id="backups" apiKey="backups" errors={errors}>
            <BackupsCheckbox
              plans={plans}
              plan={plan}
              checked={backups}
              name="backups"
              id="backups"
              onChange={this.onChange}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddLinode.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  images: PropTypes.object.isRequired,
  plans: PropTypes.object.isRequired,
};
