import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ModalFormGroup, Input, Textarea } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';
import TimeDisplay from '~/components/TimeDisplay';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class EditImage extends Component {
  static title = 'Edit Image'

  static trigger(dispatch, image) {
    return dispatch(showModal(EditImage.title, (
      <EditImage
        dispatch={dispatch}
        image={image}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      description: props.image.description,
      label: props.image.label,
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { description, label } = this.state;
    const { image, dispatch } = this.props;

    const requests = [hideModal];
    requests.unshift(() => api.images.put({ label, description }, image.id));

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  render() {
    const { image, dispatch } = this.props;
    const { label, description, errors } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={() => dispatch(hideModal())}
        analytics={{ title: EditImage.title }}
        errors={errors}
      >
        <div>
          <ModalFormGroup errors={errors} id="label" label="Label" apiKey="label">
            <Input
              id="label"
              name="label"
              placeholder="Label"
              value={label}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Created">
            <TimeDisplay
              time={image.created}
              capitalize
            />
          </ModalFormGroup>
          <ModalFormGroup label="Size">
            {image.min_deploy_size} MB
          </ModalFormGroup>
          <ModalFormGroup errors={errors} id="description" label="Description" apiKey="description">
            <div>
              <Textarea
                value={description}
                onChange={this.onChange}
                id="description"
                name="description"
              />
            </div>
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

EditImage.propTypes = {
  image: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};
