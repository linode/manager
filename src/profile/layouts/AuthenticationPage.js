import React, { Component } from 'react';

import Card from '~/components/Card';
import {
  Select, PasswordInput, Form, FormGroup, FormGroupError, SubmitButton,
} from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';

export default class AuthenticationPage extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      expires: '',
      errors: {},
      fetching: false,
    };
  }

  passwordOnSubmit = async () => {
    // eslint-disable-next-line no-unused-vars
    const { password, expires } = this.state;

    this.setState({ fetching: true, errors: {} });

    try {
      // eslint-disable-next-line no-unused-vars
      const expiresInDays = expires * 30;
      // TODO: hook up to API
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ fetching: false });
  }

  tfaOnSubmit = async () => {}

  render() {
    const { password, expires, errors, fetching } = this.state;

    return (
      <div>
        <Card title="Change password">
          <Form onSubmit={this.passwordOnSubmit}>
            <FormGroup className="row" errors={errors} name="password">
              <div className="col-sm-2 label-col">
                <label>New password:</label>
              </div>
              <div className="col-sm-10">
                <PasswordInput
                  onChange={password => this.setState({ password })}
                  value={password}
                />
                <FormGroupError errors={errors} name="password" />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="expires">
              <div className="col-sm-2 label-col">
                <label>Expires:</label>
              </div>
              <div className="col-sm-10">
                <Select disabled onChange={expires => this.setState({ expires })} value={expires}>
                  <option value="0">Never</option>
                  <option value="1">In 1 month</option>
                  <option value="3">In 3 months</option>
                  <option value="6">In 6 months</option>
                </Select>
                <FormGroupError errors={errors} name="expires" />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="col-sm-10 offset-sm-2">
                <SubmitButton disabled={fetching} />
              </div>
            </FormGroup>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
        <Card title="Two-factor Authentication">
          <Form onSubmit={this.tfaOnSubmit}>
            {/* TODO: this info is conditional on your actual TFA status */}
            <p>Two-factor authentication is currently disabled.</p>
            <SubmitButton>Enable</SubmitButton>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
      </div>
    );
  }
}
