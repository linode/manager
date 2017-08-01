import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  PasswordInput,
  SubmitButton,
} from 'linode-components/forms';

import { setPassword } from '~/api/profile';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectExpiration from '../components/SelectExpiration';


export default class ChangePassword extends Component {
  constructor() {
    super();

    this.state = {
      password: '',
      expires: null,
      errors: {},
      loading: false,
    };
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { password, expires } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setPassword(password, SelectExpiration.map(expires)),
      () => this.setState({ password: '', expires: null }),
    ]));
  }

  onChange = ({ target: { value, name } }) => this.setState({ [name]: value })

  render() {
    const { password, expires, errors, loading } = this.state;

    return (
      <Card header={<CardHeader title="Change password" />}>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Password Settings' }}
        >
          <FormGroup className="row" errors={errors} name="password">
            <label htmlFor="password" className="col-sm-2 col-form-label">New password</label>
            <div className="col-sm-10">
              <PasswordInput
                name="password"
                id="password"
                value={password}
                onChange={this.onChange}
              />
              <FormGroupError errors={errors} name="password" />
            </div>
          </FormGroup>
          <FormGroup className="row" errors={errors} name="expires">
            <label className="col-sm-2 col-form-label">Expires</label>
            <div className="col-sm-10">
              <SelectExpiration
                id="expires"
                name="expires"
                value={expires}
                onChange={this.onChange}
              />
              <FormGroupError errors={errors} name="expires" />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="col-sm-10 offset-sm-2">
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Password changed." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

ChangePassword.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
