import React, { PropTypes } from 'react';
import {
  FormGroup, FormGroupError, Form, SubmitButton, Input,
} from '~/components/form';
import { ErrorSummary } from '~/errors';

export default function NewSlaveZone(props) {
  return (
    <Form onSubmit={props.onSubmit}>
      <FormGroup errors={props.errors} name="dnszone" className="row">
        <label className="col-sm-2 col-form-label">Domain:</label>
        <div className="col-sm-6">
          <Input
            className="form-control"
            value={props.dnszone}
            placeholder="mydomain.net"
            onChange={props.onChange('dnszone')}
          />
        </div>
        <FormGroupError errors={props.errors} name="dnszone" />
      </FormGroup>
      <FormGroup errors={props.errors} name="master_ips" className="row">
        <label className="col-sm-2 col-form-label">Masters:</label>
        <div className="col-sm-6">
          <textarea
            value={props.master_ips.length ? props.master_ips.join(';') : ''}
            className="form-control"
            placeholder="127.0.0.1;255.255.255.1"
            onChange={props.onChange('master_ips')}
          />
          <small className="text-muted">
            The IP addresses of the master DNS servers for this<br />
            zone must be semicolon or new line delimited.
          </small>
        </div>
        <FormGroupError errors={props.errors} name="master_ips" />
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

NewSlaveZone.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  master_ips: PropTypes.any.isRequired,
  dnszone: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  errors: PropTypes.any.isRequired,
};
