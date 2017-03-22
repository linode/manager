import React, { Component, PropTypes } from 'react';
import {
  Form,
  FormGroup,
  FormGroupError,
  PasswordInput,
  Input,
  Checkbox,
} from '~/components/form';
import { ErrorSummary } from '~/errors';
import { SubmitButton } from '~/components/form';

export class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      email: props.email,
      password: null,
      restricted: props.restricted,
      restrictedLabel: props.restrictedLabel,
    };
  }

  render() {
    const { errors, onSubmit } = this.props;
    const {
      username,
      email,
      password,
      restricted,
      restrictedLabel,
    } = this.state;

    return (
      <Form
        onSubmit={async () => {
          const values = {
            ...this.state,
          };
          await onSubmit(values);
        }}
      >
        <FormGroup errors={errors} name="username" className="row">
          <label className="col-sm-2 col-form-label">Username</label>
          <div className="col-sm-6">
            <Input
              id="user-username"
              value={username}
              onChange={e => this.setState({ username: e.target.value })}
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
              onChange={e => this.setState({ email: e.target.value })}
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
          <div className="offset-sm-2 col-sm-6">
            <Checkbox
              id="restricted"
              checked={!!restricted}
              onChange={() => this.setState({ restricted: !restricted })}
              label={restrictedLabel}
            />
          </div>
          <FormGroupError errors={errors} name="restricted" />
        </FormGroup>
        <ErrorSummary errors={errors} />
        <div className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton>Submit</SubmitButton>
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
  restrictedLabel: PropTypes.string,
  errors: PropTypes.any,
};

UserForm.defaultProps = {
  username: '',
  email: '',
};
