import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import {
  FormGroup, FormGroupError, Form, SubmitButton, Input,
} from 'linode-components/forms';

import { domains } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export default class NewMasterZone extends Component {
  constructor(props) {
    super(props);

    this.state = {
      domain: '',
      email: props.email,
      loading: false,
      errors: {},
    };
  }

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { domain, email } = this.state;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [
        () => domains.post({ domain, soa_email: email, type: 'master' }),
        () => push(`/domains/${domain}`),
      ],
    ]));
  }

  onChange = ({ target: { value, name } }) => this.setState({ [name]: value })

  render() {
    const { errors, loading, domain, email } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup errors={errors} name="domain" className="row">
          <label htmlFor="domain" className="col-sm-2 col-form-label">Domain</label>
          <div className="col-sm-10 clearfix">
            <Input
              id="domain"
              name="domain"
              placeholder="mydomain.net"
              value={domain}
              onChange={this.onChange}
              className="float-sm-left"
            />
            <FormGroupError className="float-sm-left" errors={errors} name="domain" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="soa_email" className="row">
          <label className="col-sm-2 col-form-label">SOA Email</label>
          <div className="col-sm-10 clearfix">
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={this.onChange}
              className="float-sm-left"
            />
            <FormGroupError className="float-sm-left" errors={errors} name="soa_email" />
          </div>
        </FormGroup>
        <FormGroup className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton
              disabled={loading}
              disabledChildren="Adding Domain"
            >Add Domain</SubmitButton>
            <FormSummary errors={errors} />
          </div>
        </FormGroup>
      </Form>
    );
  }
}

NewMasterZone.propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
};
