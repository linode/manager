import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { Card } from '~/components/cards';
import {
  Select, PasswordInput, Form, FormGroup, FormGroupError, SubmitButton,
} from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { profilePassword } from '~/api/account';

export class AuthenticationPage extends Component {
  constructor() {
    super();
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
    const expiresOn = expires === '0' ? null :
      moment()
        .add(parseInt(expires), 'days')
        .utc()
        .format('YYYY-MM-DDTHH:mm:ss')
        .toString();

    this.setState({ fetching: true, errors: {} });

    try {
      await dispatch(profilePassword({
        password,
        expires: expiresOn,
      }));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ fetching: false });
  }

  tfaOnSubmit = async () => {}

  render() {
    const { password, expires, errors } = this.state;

    return (
      <div>
        <Card title="Change password">
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
                <Select
                  id="expires"
                  onChange={e => this.setState({ expires: e.target.value })}
                  value={expires}
                >
                  <option value="0">Never</option>
                  <option value="30">In 1 month</option>
                  <option value="90">In 3 months</option>
                  <option value="180">In 6 months</option>
                </Select>
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
        <Card title="Change two-factor authentication setting">
          <Form onSubmit={this.tfaOnSubmit}>
            {/* TODO: this info is conditional on your actual TFA status */}
            <p>Two-factor authentication is currently disabled.</p>
            <SubmitButton disabled>Enable</SubmitButton>
            <ErrorSummary errors={errors} />
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
