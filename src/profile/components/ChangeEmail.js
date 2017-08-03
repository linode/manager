import React, { PropTypes, Component } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  SubmitButton,
  Input,
} from 'linode-components/forms';

import { profile } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class ChangeEmail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      errors: {},
      email: props.email,
    };
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { email } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => profile.put({ email }),
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { loading, errors, email } = this.state;

    return (
      <Card header={<CardHeader title="Change email" />}>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Email Settings' }}
        >
          <FormGroup className="row" errors={errors} name="email">
            <label htmlFor="email" className="col-sm-2 col-form-label">Email</label>
            <div className="col-sm-10">
              <Input
                id="email"
                type="email"
                name="email"
                onChange={this.onChange}
                value={email}
              />
              <FormGroupError errors={errors} name="email" />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Email saved." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

ChangeEmail.propTypes = {
  email: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
