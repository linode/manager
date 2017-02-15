import React, { PropTypes } from 'react';
import {
  FormGroup, FormGroupError, Form, SubmitButton,
} from '~/components/form';
import { ErrorSummary } from '~/errors';

export default function NewMasterZone(props) {
  return (
    <Form onSubmit={props.onSubmit}>
      <FormGroup errors={props.errors} name="dnszone" className="row">
        <label className="col-sm-2 col-form-label">Domain:</label>
        <div className="col-sm-6">
          <input
            className="form-control"
            placeholder="mydomain.net"
            value={props.dnszone}
            onChange={props.onChange('dnszone')}
          />
        </div>
        <FormGroupError errors={props.errors} name="dnszone" />
      </FormGroup>
      <FormGroup errors={props.errors} name="soa_email" className="row">
        <label className="col-sm-2 col-form-label">SOA email:</label>
        <div className="col-sm-6">
          <input
            type="email"
            value={props.soa_email}
            className="form-control"
            onChange={props.onChange('soa_email')}
          />
        </div>
        <FormGroupError errors={props.errors} name="soa_email" />
      </FormGroup>
      <div className="row">
        <div className="col-sm-2"></div>
        <div className="col-sm-6">
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
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  soa_email: PropTypes.string.isRequired,
  dnszone: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  errors: PropTypes.any.isRequired,
};
