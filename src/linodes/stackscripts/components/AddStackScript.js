import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';
import * as utilities from 'linode-components/forms/utilities';

import { showModal, hideModal } from '~/actions/modal';
import { stackscripts } from '~/api';
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

    this.onChange = utilities.onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { label } = this.state;

    const data = {
      label,
      distributions: [DEFAULT_DISTRIBUTION],
      script: '#!/bin/bash\n\n# Your script goes here.',
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => stackscripts.post(data),
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
