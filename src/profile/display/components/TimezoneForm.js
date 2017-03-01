import React, { PropTypes } from 'react';

import { Form, FormGroup, SubmitButton, Select } from '~/components/form';
import { ErrorSummary } from '~/errors';

import { TIME_ZONES } from '~/constants';

export default function TimezoneForm(props) {
  return (
    <Form onSubmit={props.onSubmit}>
      <FormGroup className="row">
        <label htmlFor="timezone" className="col-sm-2 col-form-label">Timezone:</label>
        <div className="col-sm-10">
          <Select
            id="timezone"
            name="timezone"
            onChange={props.onChange}
            value={props.timezone}
            options={TIME_ZONES.map(zone => ({ value: zone, label: zone }))}
          />
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

TimezoneForm.propTypes = {
  errors: PropTypes.object,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  timezone: PropTypes.string,
};
