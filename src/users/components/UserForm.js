import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';

import {
  Form, FormGroup, FormGroupError, PasswordInput, Input, Checkboxes, Radio, SubmitButton,
} from 'linode-components/forms';

import { users } from '~/api';
import { setTitle } from '~/actions/title';
import { actions } from '~/api/configs/users';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export default class UserForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: props.user.username,
      email: props.user.email,
      restricted: props.user.restricted,
      password: '',
      loading: false,
      errors: {},
    };
  }

  onChange = ({ target: { name, value, type } }) =>
    this.setState({ [name]: type === 'radio' ? value === 'true' : value })

  onSubmit = () => {
    const { dispatch, user: { username: oldUsername } } = this.props;
    const data = {
      username: this.state.username,
      email: this.state.email,
      restricted: this.state.restricted,
      password: this.state.password,
    };

    if (oldUsername) {
      delete data.password;
    }

    const idsPath = [oldUsername].filter(Boolean);
    return dispatch(dispatchOrStoreErrors.call(this, [
      () => users[oldUsername ? 'put' : 'post'](data, ...idsPath),
      () => oldUsername !== data.username && push(`/users/${data.username}`),
      () => oldUsername !== data.username && actions.delete(data.username),
      () => setTitle(data.username),
    ]));
  }

  render() {
    const { username, email, restricted, password, loading, errors } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
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
              className="float-sm-left"
            />
            <FormGroupError errors={errors} name="email" className="float-sm-left" />
          </div>
        </FormGroup>
        {this.props.user.username ? null :
          <FormGroup errors={errors} name="password" className="row">
            <label htmlFor="password" className="col-sm-2 col-form-label">Password</label>
            <div className="col-sm-10 clearfix">
              <PasswordInput
                name="password"
                id="password"
                value={password}
                onChange={this.onChange}
              />
              <FormGroupError errors={errors} name="password" className="float-sm-left" />
            </div>
          </FormGroup>
        }
        <FormGroup errors={errors} name="restricted" className="row">
          <label className="col-sm-2 col-form-label">Restricted</label>
          <div className="col-sm-10 clearfix">
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
