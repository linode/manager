import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  PasswordInput, Form, FormGroup, FormGroupError, SubmitButton,
} from 'linode-components/forms';
import { ErrorSummary, reduceErrors } from '~/errors';
import { setPassword } from '~/api/account';
import SelectExpiration from '../components/SelectExpiration';
import { TwoFactorPanel } from '../components/TwoFactorPanel';

export class AuthenticationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      expires: '0',
      errors: {},
      fetching: false,
    };
  }

  passwordOnSubmit = async () => {
    const { dispatch } = this.props;
    const { password, expires } = this.state;

    this.setState({ fetching: true, errors: {} });

    try {
      await dispatch(setPassword(password, SelectExpiration.map(expires)));
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors: errors });
    }

    this.setState({ fetching: false });
  }

  render() {
    const { password, expires, errors } = this.state;

    return (
      <div>
        <Card header={<CardHeader title="Change password" />}>
          <Form onSubmit={this.passwordOnSubmit}>
            <FormGroup className="row" errors={errors} name="password">
              <label className="col-sm-2 col-form-label">New password:</label>
              <div className="col-sm-10">
                <PasswordInput
                  onChange={password => this.setState({ password })}
                  value={password}
                  id="new-password"
                />
                <FormGroupError errors={errors} name="password" />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="expires">
              <label className="col-sm-2 col-form-label">Expires:</label>
              <div className="col-sm-10">
                <SelectExpiration
                  id="expires"
                  name="expires"
                  value={expires}
                  onChange={e => this.setState({ expires: e.target.value })}
                />
                <FormGroupError errors={errors} name="expires" />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="col-sm-10 offset-sm-2">
                <SubmitButton />
              </div>
            </FormGroup>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
        <TwoFactorPanel {...this.props} />
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
