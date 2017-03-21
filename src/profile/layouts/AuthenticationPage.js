import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from '~/components/cards';
import {
  PasswordInput, Form, FormGroup, FormGroupError, SubmitButton,
} from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { setPassword } from '~/api/account';
import SelectExpiration from '../components/SelectExpiration';

export class AuthenticationPage extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      expires: '0',
      passwordErrors: {},
      tfaErrors: {},
      fetching: false,
    };
  }

  passwordOnSubmit = async () => {
    const { dispatch } = this.props;
    const { password, expires } = this.state;

    this.setState({ fetching: true, passwordErrors: {} });

    try {
      await dispatch(setPassword(password, SelectExpiration.map(expires)));
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ passwordErrors: errors });
    }

    this.setState({ fetching: false });
  }

  tfaOnSubmit = async () => {}

  render() {
    const { password, expires, passwordErrors, tfaErrors } = this.state;

    return (
      <div>
        <Card title="Change password">
          <Form onSubmit={this.passwordOnSubmit}>
            <FormGroup className="row" errors={passwordErrors} name="password">
              <label className="col-sm-2 col-form-label">New password:</label>
              <div className="col-sm-10">
                <PasswordInput
                  onChange={password => this.setState({ password })}
                  value={password}
                  id="new-password"
                />
                <FormGroupError errors={passwordErrors} name="password" />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={passwordErrors} name="expires">
              <label className="col-sm-2 col-form-label">Expires:</label>
              <div className="col-sm-10">
                <SelectExpiration
                  id="expires"
                  name="expires"
                  value={expires}
                  onChange={e => this.setState({ expires: e.target.value })}
                />
                <FormGroupError errors={passwordErrors} name="expires" />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="col-sm-10 offset-sm-2">
                <SubmitButton />
              </div>
            </FormGroup>
            <ErrorSummary errors={passwordErrors} />
          </Form>
        </Card>
        <Card title="Change two-factor authentication setting">
          <Form onSubmit={this.tfaOnSubmit}>
            {/* TODO: this info is conditional on your actual TFA status */}
            <p>Two-factor authentication is currently disabled.</p>
            <SubmitButton disabled>Enable</SubmitButton>
            <ErrorSummary errors={tfaErrors} />
          </Form>
        </Card>
      </div>
    );
  }
}

AuthenticationPage.propTypes = {
  dispatch: PropTypes.func,
  profile: PropTypes.object,
};

function select(state) {
  return {
    profile: state.api.profile,
  };
}

export default connect(select)(AuthenticationPage);
