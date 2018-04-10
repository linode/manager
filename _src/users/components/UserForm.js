import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';
import Form from 'linode-components/dist/forms/Form';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import FormGroupError from 'linode-components/dist/forms/FormGroupError';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import Checkboxes from 'linode-components/dist/forms/Checkboxes';
import Radio from 'linode-components/dist/forms/Radio';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';
import Input from 'linode-components/dist/forms/Input';
import { onChange } from 'linode-components/dist/forms/utilities';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { actions } from '~/api/generic/users';


export class UserForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: props.user.username,
      email: props.user.email,
      restricted: props.user.restricted ? 'yes' : 'no',
      loading: false,
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, user: { username: oldUsername } } = this.props;
    const data = {
      username: this.state.username,
      email: this.state.email,
      restricted: this.state.restricted === 'yes',
    };

    const creating = !oldUsername;

    const idsPath = [oldUsername].filter(Boolean);
    // this logic may be deleting more data than it is supposed to be deleting
    // when you save an existing user, but it isn't currently causing any
    // problems
    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.users[creating ? 'post' : 'put'](data, ...idsPath),
      (user) => creating ? null : actions.one(user),
      () => oldUsername !== data.username && push(`/users/${data.username}`),
      () => oldUsername !== data.username && actions.delete(oldUsername),
    ]));
  }

  render() {
    const { user: { username: oldUsername } } = this.props;
    const { username, email, restricted, loading, errors } = this.state;

    return (
      <Form
        onSubmit={this.onSubmit}
        analytics={{ title: 'Add/Edit User', action: oldUsername ? 'edit' : 'add' }}
      >
        <FormGroup errors={errors} name="username" className="row">
          <label htmlFor="username" className="col-sm-2 col-form-label">Username</label>
          <div className="col-sm-10 clearfix">
            <Input
              name="username"
              id="username"
              value={username}
              onChange={this.onChange}
              className="float-sm-left"
            />
            <FormGroupError errors={errors} name="username" className="float-sm-left" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="email" className="row">
          <label htmlFor="email" className="col-sm-2 col-form-label">Email</label>
          <div className="col-sm-10 clearfix">
            <Input
              name="email"
              id="email"
              value={email}
              onChange={this.onChange}
              readOnly
              className="float-sm-left"
            />
            <FormGroupError errors={errors} name="email" className="float-sm-left" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="restricted" className="row">
          <label className="col-sm-2 col-form-label">Restricted</label>
          <div className="col-sm-10 clearfix">
            <Checkboxes className="float-sm-left">
              <Radio
                id="restricted"
                name="restricted"
                value="yes"
                checked={restricted === 'yes'}
                onChange={this.onChange}
                label="Yes - this user can only do what I specify"
              />
              <Radio
                id="unrestricted"
                name="restricted"
                value="no"
                checked={restricted === 'no'}
                onChange={this.onChange}
                label="No - this user has no access restrictions"
              />
            </Checkboxes>
            <FormGroupError errors={errors} name="restricted" className="float-sm-left" />
          </div>
        </FormGroup>
        <div className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton
              disabled={loading}
              disabledChildren={this.props.user.username ? undefined : 'Adding User'}
            >{this.props.user.username ? undefined : 'Add User'}</SubmitButton>
            <FormSummary
              errors={errors}
              success={this.props.user.username && 'User settings saved.'}
            />
          </div>
        </div>
      </Form>
    );
  }
}

UserForm.propTypes = {
  user: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

UserForm.defaultProps = {
  user: {
    username: '',
    email: '',
    restricted: true,
  },
};
export default UserForm;
