import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import Form from 'linode-components/dist/forms/Form';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import FormGroupError from 'linode-components/dist/forms/FormGroupError';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import PasswordInput from 'linode-components/dist/forms/PasswordInput';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';
import { onChange } from 'linode-components/dist/forms/utilities';

import { setPassword } from '~/api/ad-hoc/profile';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectExpiration from './SelectExpiration';


export default class ChangePassword extends Component {
  constructor() {
    super();

    this.state = {
      password: '',
      expires: '',
      errors: {},
      loading: false,
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { password, expires } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setPassword(password, SelectExpiration.map(expires)),
      () => this.setState({ password: '', expires: '' }),
    ]));
  }

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
          <FormGroup className="row" name="submit">
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
