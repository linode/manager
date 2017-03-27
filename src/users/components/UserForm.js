import React, { Component, PropTypes } from 'react';
import {
  Form,
  FormGroup,
  FormGroupError,
  PasswordInput,
  Input,
  Checkboxes,
  Radio,
} from '~/components/form';
import { ErrorSummary } from '~/errors';
import { SubmitButton } from '~/components/form';

export class UserForm extends Component {
  constructor(props) {
    super(props);
    this.formSubmit = this.formSubmit.bind(this);
    this.state = {
      username: props.username,
      email: props.email,
      restricted: props.restricted,
      password: '',
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  formSubmit() {
    const { onSubmit } = this.props;
    const values = {
      ...this.state,
    };
    onSubmit(values);
  }

  render() {
    const { errors } = this.props;
    const {
      username,
      email,
      restricted,
      password,
    } = this.state;
    console.log(restricted ? "true" : "false");
    return (
      <Form
        onSubmit={this.formSubmit}
      >
        <FormGroup errors={errors} name="username" className="row">
          <label className="col-sm-2 col-form-label">Username</label>
          <div className="col-sm-6">
            <Input
              id="user-username"
              value={username}
              name="username"
              onChange={this.onChange}
            />
            <FormGroupError errors={errors} name="username" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="email" className="row">
          <label className="col-sm-2 col-form-label">Email</label>
          <div className="col-sm-6">
            <Input
              id="user-email"
              value={email}
              name="email"
              onChange={this.onChange}
            />
            <FormGroupError errors={errors} name="email" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="password" className="row">
          <label className="col-sm-2 col-form-label">Password</label>
          <div className="col-sm-6">
            <PasswordInput
              onChange={password => this.setState({ password })}
              value={password}
              id="new-password"
            />
            <FormGroupError errors={errors} name="password" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="restricted" className="row">
          <label className="col-sm-2 col-form-label">Restricted</label>
          <div className="col-sm-6">
            <Checkboxes>
              <Radio
                id="user-restricted"
                checked={restricted}
                onChange={() => this.setState({ restricted: true })}
                label="Yes - this user can only do what I specify"
              />
              <Radio
                id="user-unrestricted"
                checked={!restricted}
                onChange={() => this.setState({ restricted: false })}
                label="No - this user has no access restrictions"
              />
            </Checkboxes>
            <FormGroupError errors={errors} name="restricted" />
          </div>
        </FormGroup>
        <ErrorSummary errors={errors} />
        <div className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton>{this.props.username ? 'Save' : 'Add User'}</SubmitButton>
          </div>
        </div>
      </Form>
    );
  }
}

UserForm.propTypes = {
  onSubmit: PropTypes.func,
  username: PropTypes.string,
  email: PropTypes.string,
  restricted: PropTypes.bool,
  errors: PropTypes.any,
};

UserForm.defaultProps = {
  username: '',
  email: '',
  restricted: true,
};
