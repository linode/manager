import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import { Input, ModalFormGroup, Select, PasswordInput } from 'linode-components/forms';
import { Link } from 'react-router';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { RegionSelect } from '~/components';

import BackupsCheckbox from './BackupsCheckbox';
import PlanSelect from './PlanSelect';


export default class LinodeFromImage extends Component {
  static title = 'Create from Image'

  static async trigger(dispatch, plans, images) {
    const imageOptions = Object.values(images.images).map(
      image => ({ label: image.label, value: image.id })
    );

    return dispatch(showModal(LinodeFromImage.title, (
      <LinodeFromImage
        dispatch={dispatch}
        images={imageOptions}
        close={() => dispatch(hideModal())}
        plans={plans}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {}, backups: false, password: '' };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { label, image, plan, backups, region, password } = this.state;
    const data = {
      label,
      backups_enabled: backups,
      type: plan,
      region,
      root_pass: password,
      image: parseInt(image),
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.linodes.post(data),
      ({ label }) => push(`/linodes/${label}`),
    ]));
  }

  render() {
    const { close, plans, images } = this.props;
    const {
      errors, label, plan, backups, image, region, password,
    } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        noSubmit={!images.length}
        buttonText="Create"
        buttonDisabledText="Creating"
        analytics={{ title: LinodeFromImage.title, action: 'add' }}
        errors={errors}
      >
        {images.length ?
          <div>
            <ModalFormGroup label="Image" id="image" apiKey="image" errors={errors}>
              <Select
                options={images}
                value={image}
                name="image"
                id="image"
                onChange={this.onChange}
              />
            </ModalFormGroup>
            <ModalFormGroup label="Label" id="label" apiKey="label" errors={errors}>
              <Input
                placeholder="my-linode"
                value={label}
                name="label"
                id="label"
                onChange={this.onChange}
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
                disabled={false}
              />
            </ModalFormGroup>
          </div>
        :
          <div>You have no Images! Click on <Link to="/images">Images</Link> to create some.</div>
        }
      </FormModalBody>
    );
  }
}

LinodeFromImage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  images: PropTypes.object.isRequired,
  plans: PropTypes.object.isRequired,
};
