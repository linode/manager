import React, { PropTypes } from 'react';
import {
  FormGroup, FormGroupError, Form, SubmitButton, Input,
} from '~/components/form';
import { ErrorSummary } from '~/errors';

export default function NewImportZone(props) {
  return (
    <Form onSubmit={props.onSubmit}>
      <FormGroup errors={props.errors} name="dnszone" className="row">
        <label className="col-sm-2 col-form-label">Domain</label>
        <div className="col-sm-6">
          <Input
            className="form-control"
            value={props.dnszone}
            placeholder="example.com"
            onChange={props.onChange('dnszone')}
            disabled
          />
        </div>
        <FormGroupError errors={props.errors} name="dnszone" />
      </FormGroup>
      <FormGroup errors={props.errors} name="axfr_ips" className="row">
        <label className="col-sm-2 col-form-label">Remote nameserver</label>
        <div className="col-sm-6">
          <Input
            className="form-control"
            value={props.axfr_ips}
            placeholder="44.55.66.77"
            onChange={props.onChange('axfr_ips')}
            disabled
          />
          <div>
            <small className="text-muted">
              Your nameserver must allow zone transfer (AXFR) from
              96.126.114.97, 96.126.114.98, 2600:3c00::5e, and 2600:3c00::5f.
            </small>
          </div>
        </div>
        <FormGroupError errors={props.errors} name="axfr_ips" />
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

NewImportZone.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  axfr_ips: PropTypes.any.isRequired,
  dnszone: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  errors: PropTypes.any.isRequired,
};
