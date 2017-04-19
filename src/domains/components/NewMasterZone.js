import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import {
  FormGroup, FormGroupError, Form, SubmitButton, Input,
} from 'linode-components/forms';
import { ErrorSummary } from '~/errors';

export default function NewMasterZone(props) {
  return (
    <Form onSubmit={props.onSubmit}>
      <FormGroup errors={props.errors} name="domain" className="row">
        <label className="col-sm-2 col-form-label">Domain</label>
        <div className="col-sm-10">
          <Input
            placeholder="mydomain.net"
            value={props.domain}
            onChange={props.onChange('domain')}
          />
          <FormGroupError errors={props.errors} name="domain" inline={false} />
        </div>
      </FormGroup>
      <FormGroup errors={props.errors} name="soa_email" className="row">
        <label className="col-sm-2 col-form-label">SOA email</label>
        <div className="col-sm-10">
          <Input
            type="email"
            value={props.soa_email}
            onChange={props.onChange('soa_email')}
          />
          <FormGroupError errors={props.errors} name="soa_email" inline={false} />
        </div>
      </FormGroup>
      <div className="row">
        <div className="offset-sm-2 col-sm-10">
          <SubmitButton
            disabled={props.loading}
          >Create</SubmitButton>
        </div>
      </div>
      <ErrorSummary errors={props.errors} />
    </Form>
  );
}

NewMasterZone.propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
};
