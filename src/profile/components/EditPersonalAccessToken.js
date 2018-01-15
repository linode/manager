import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Input from 'linode-components/dist/forms/Input';
import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import { onChange } from 'linode-components/dist/forms/utilities';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class EditPersonalAccessToken extends Component {
  static title = 'Edit Personal Access Token'

  static trigger(dispatch, token) {
    dispatch(showModal(EditPersonalAccessToken.title, (
      <EditPersonalAccessToken
        id={token.id}
        label={token.label}
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      label: props.label,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { label } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.tokens.put({ label }, id),
      close,
    ]));
  }

  render() {
    const { errors, label } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={this.props.close}
        errors={errors}
        analytics={{ title: EditPersonalAccessToken.title }}
      >
        <ModalFormGroup id="label" label="Label" apiKey="label" errors={errors}>
          <Input
            name="label"
            id="label"
            placeholder="My token"
            value={label}
            onChange={this.onChange}
          />
        </ModalFormGroup>
      </FormModalBody>
    );
  }
}

EditPersonalAccessToken.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
};
