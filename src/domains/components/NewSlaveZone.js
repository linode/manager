import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import {
  FormGroup, FormGroupError, Form, SubmitButton, Input,
} from 'linode-components/forms';
import { ErrorSummary } from '~/errors';

export default function NewSlaveZone(props) {
  return (
    <Form onSubmit={props.onSubmit}>
      <FormGroup errors={props.errors} name="domain" className="row">
        <label className="col-sm-2 col-form-label">Domain</label>
        <div className="col-sm-6">
          <Input
            className="form-control"
            value={props.domain}
            placeholder="mydomain.net"
            onChange={props.onChange('domain')}
          />
        </div>
        <FormGroupError errors={props.errors} name="domain" />
      </FormGroup>
      <FormGroup errors={props.errors} name="master_ips" className="row">
        <label className="col-sm-2 col-form-label">Master Zones</label>
        <div className="col-sm-10">
          <textarea
            value={props.master_ips.length ? props.master_ips.join(';') : ''}
            placeholder="172.92.1.4;209.124.103.15"
            onChange={props.onChange('master_ips')}
          />
          <div>
            <small className="text-muted">
              Use semicolons or new lines to separate multiple IP addresses.
            </small>
          </div>
        </div>
      </Form>
    );
  }
}

NewSlaveZone.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
