import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import {
  FormGroup, FormGroupError, Form, SubmitButton, Input,
} from 'linode-components/forms';

import { domains } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export default class NewSlaveZone extends Component {
  constructor(props) {
    super(props);

    this.state = {
      domain: '',
      ips: '',
      loading: false,
      errors: {},
    };
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { domain, ips } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.post({ domain, ips: ips.split(';'), type: 'slave' }),
      () => push('/domains'),
    ]));
  }

  onChange = ({ target: { value, name } }) => this.setState({ [name]: value })

  render() {
    const { errors, loading, domain, ips } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup errors={errors} name="domain" className="row">
          <label className="col-sm-2 col-form-label">Domain</label>
          <div className="col-sm-10 clearfix">
            <Input
              name="domain"
              value={domain}
              placeholder="mydomain.net"
              onChange={this.onChange}
              className="float-sm-left"
            />
            <FormGroupError className="float-sm-left" errors={errors} name="domain" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="master_ips" className="row">
          <label className="col-sm-2 col-form-label">Master Zones</label>
          <div className="col-sm-10 clearfix">
            <div className="float-sm-left">
              <textarea
                name="ips"
                value={ips}
                placeholder="172.92.1.4;209.124.103.15"
                onChange={this.onChange}
              />
              <div>
                <small className="text-muted">
                  Use semicolons or new lines to separate multiple IP addresses.
                </small>
              </div>
            </div>
            <FormGroupError className="float-sm-left" errors={errors} name="master_ips" />
          </div>
        </FormGroup>
        <div className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton disabled={loading} disabledChildren="Adding Domain">
              Add Domain
            </SubmitButton>
            <FormSummary errors={errors} />
          </div>
        </div>
      </Form>
    );
  }
}

NewSlaveZone.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
