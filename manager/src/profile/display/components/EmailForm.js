import React, { PropTypes } from 'react';

import { Form, FormGroup, FormGroupError, SubmitButton, Input } from 'linode-components/forms';
import { ErrorSummary } from '~/errors';

export default function EmailForm(props) {
  return (
    <Form onSubmit={props.onSubmit}>
      <FormGroup className="row" errors={props.errors} name="email">
        <label htmlFor="email" className="col-sm-2 col-form-label">Email:</label>
        <div className="col-sm-10">
          <Input
            id="email"
            type="email"
            name="email"
            onChange={props.onChange}
            value={props.email}
          />
          <FormGroupError errors={props.errors} name="email" />
        </div>
      </FormGroup>
      <FormGroup className="row">
        <div className="offset-sm-2 col-sm-10">
          <SubmitButton />
        </div>
      </FormGroup>
      <ErrorSummary errors={props.errors} />
    </Form>
  );
}

EmailForm.propTypes = {
  email: PropTypes.string,
  errors: PropTypes.object,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};
