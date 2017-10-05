import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import { Checkboxes, Input, ModalFormGroup, PasswordInput, Radio } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { users } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class AddUser extends Component {
  static title = 'Add a User'

  static trigger(dispatch) {
    return dispatch(showModal(AddUser.title, (
      <AddUser
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {}, username: '', email: '', password: '' };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const data = {
      username: this.state.username,
      email: this.state.email,
      restricted: this.state.restricted,
      password: this.state.password,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => users.post(data),
      () => push(`/users/${data.username}`),
    ]));
  }

  render() {
    const { close } = this.props;
    const { errors, username, email, restricted, password } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Add User"
        buttonDisabledText="Adding User"
        analytics={{ title: AddUser.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup label="Username" errors={errors} id="username" apiKey="username">
            <Input
              name="username"
              id="username"
              value={username}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Email" errors={errors} id="email" apiKey="email">
            <Input
              name="email"
              id="email"
              value={email}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Password" errors={errors} id="password" apiKey="password">
            <PasswordInput
              name="password"
              id="password"
              value={password}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Restricted" errors={errors} id="restricted" apiKey="restricted">
            <Checkboxes className="float-sm-left">
              <Radio
                id="restricted"
                name="restricted"
                value
                checked={restricted}
                onChange={this.onChange}
                label="Yes - this user can only do what I specify"
              />
              <Radio
                id="unrestricted"
                name="restricted"
                value={false}
                checked={!restricted}
                onChange={this.onChange}
                label="No - this user has no access restrictions"
              />
            </Checkboxes>
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddUser.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
