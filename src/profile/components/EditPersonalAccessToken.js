import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { tokens } from '~/api';
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
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = () => {
    const { dispatch, id, close } = this.props;
    const { label } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => tokens.put({ label }, id),
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
