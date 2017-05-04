import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import { Card } from 'linode-components/cards';
import {
  Form, FormGroup, FormGroupError, PasswordInput, Input, Checkboxes, Radio, SubmitButton,
} from 'linode-components/forms';

import { users } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export class CreatePage extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      errors: {},
      username: '',
      email: '',
      restricted: true,
      password: '',
    };
  }

  onChange = ({ target: { name, value, checked } }) =>
    this.setState({ [name]: name === 'restricted' ? checked : value })

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { username, email, restricted, password } = this.state;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [
        () => users.post({ username, email, restricted, password }),
        () => push(`/users/${username}`),
      ],
    ]));
  }

  render() {
    const { errors, loading, username, email, restricted, password } = this.state;

    return (
      <div className="PrimaryPage container">
        <Link to="/users">Users</Link>
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1>Add a user</h1>
          </div>
        </header>
        <div className="PrimaryPage-body">
          <Card>
            <Form onSubmit={this.onSubmit}>
              <FormGroup errors={errors} name="username" className="row">
                <label htmlFor="username" className="col-sm-2 col-form-label">Username</label>
                <div className="col-sm-10">
                  <Input
                    id="username"
                    name="username"
                    value={username}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="username" />
                </div>
              </FormGroup>
              <FormGroup errors={errors} name="email" className="row">
                <label htmlFor="email" className="col-sm-2 col-form-label">Email</label>
                <div className="col-sm-10">
                  <Input
                    id="email"
                    name="email"
                    value={email}
                    onChange={this.onChange}
                  />
                  <FormGroupError errors={errors} name="email" />
                </div>
              </FormGroup>
              <FormGroup errors={errors} name="password" className="row">
                <label htmlFor="password" className="col-sm-2 col-form-label">Password</label>
                <div className="col-sm-10">
                  <PasswordInput
                    id="password"
                    name="password"
                    value={password}
                    onChange={password => this.setState({ password })}
                  />
                  <FormGroupError
                    errors={errors}
                    name="password"
                    className="float-sm-left"
                  />
                </div>
              </FormGroup>
              <FormGroup errors={errors} name="restricted" className="row">
                <label htmlFor="restricted" className="col-sm-2 col-form-label">Restricted</label>
                <div className="col-sm-6">
                  <Checkboxes>
                    <Radio
                      name="restricted"
                      id="restricted"
                      checked={restricted}
                      value
                      onChange={() => this.setState({ restricted: true })}
                      label="Yes - this user can only do what I specify"
                    />
                    <Radio
                      name="restricted"
                      id="unrestricted"
                      checked={!restricted}
                      value={false}
                      onChange={() => this.setState({ restricted: false })}
                      label="No - this user has no access restrictions"
                    />
                  </Checkboxes>
                  <FormGroupError errors={errors} name="restricted" />
                </div>
              </FormGroup>
              <FormGroup className="row">
                <div className="offset-sm-2 col-sm-10">
                  <SubmitButton disabled={loading} disabledChildren="Adding user">
                    Add user
                  </SubmitButton>
                  <FormSummary errors={errors} />
                </div>
              </FormGroup>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}

CreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(CreatePage);
