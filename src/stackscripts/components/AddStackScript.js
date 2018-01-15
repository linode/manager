import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import Input from 'linode-components/dist/forms/Input';
import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';
import { onChange } from 'linode-components/dist/forms/utilities';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { DEFAULT_DISTRIBUTION } from '~/constants';


export default class AddStackScript extends Component {
  static title = 'Add a StackScript'

  static trigger(dispatch) {
    return dispatch(showModal(AddStackScript.title, (
      <AddStackScript dispatch={dispatch} />
    )));
  }

  constructor() {
    super();

    this.state = { errors: {}, label: '' };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { label } = this.state;

    const data = {
      label,
      images: [DEFAULT_DISTRIBUTION],
      script: '#!/bin/bash\n\n# Your script goes here.',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.stackscripts.post(data),
      ({ id }) => push(`/stackscripts/${id}`),
    ]));
  }

  render() {
    const { dispatch } = this.props;
    const { errors, label } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={() => dispatch(hideModal())}
        buttonText="Add StackScript"
        buttonDisabledText="Adding StackScript"
        analytics={{ title: AddStackScript.title, action: 'add' }}
        errors={errors}
      >
        <ModalFormGroup id="label" label="Label" apiKey="label" errors={errors}>
          <Input
            id="label"
            name="label"
            placeholder="Label"
            value={label}
            onChange={this.onChange}
          />
        </ModalFormGroup>
      </FormModalBody>
    );
  }
}

AddStackScript.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
