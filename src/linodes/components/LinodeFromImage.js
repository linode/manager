import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import { Input, ModalFormGroup, Select } from 'linode-components/forms';
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
    const imageOptions = Object.values(images.images).map(function (image) {
      return {
        label: image.label,
        value: image.id,
      };
    });

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

    this.state = { errors: {}, backups: false };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { label, image, plan, backups, region } = this.state;
    const data = {
      label,
      backups_enabled: backups,
      type: plan,
      region,
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
      errors, label, plan, backups, image, region,
    } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Create"
        buttonDisabledText="Creating"
        analytics={{ title: LinodeFromImage.title, action: 'add' }}
        errors={errors}
      >
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

LinodeFromImage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  images: PropTypes.object.isRequired,
  plans: PropTypes.object.isRequired,
};
