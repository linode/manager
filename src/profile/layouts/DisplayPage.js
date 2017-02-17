import React, { Component } from 'react';

import { TIME_ZONES } from '~/constants';
import { Card } from '~/components/cards';
import { Form, FormGroup, FormGroupError, SubmitButton, Input, Select } from '~/components/form';
import { ErrorSummary } from '~/errors';

export default class DisplayPage extends Component {
  constructor() {
    super();
    // TODO: fill state appropriately based on API
    this.state = { fetching: false, errors: {}, email: '', timezone: '' };
  }

  inputOnChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  }

  timezoneOnSubmit = () => {
  }

  emailOnSubmit = () => {
  }

  render() {
    const { errors, timezone, email } = this.state;

    return (
      <div>
        <Card title="Change timezone">
          <Form onSubmit={this.timezoneOnSubmit}>
            <FormGroup className="row">
              <label htmlFor="timezone" className="col-sm-2 col-form-label">Timezone:</label>
              <div className="col-sm-10">
                <Select
                  id="timezone"
                  name="timezone"
                  onChange={this.inputOnChange}
                  value={timezone}
                  options={TIME_ZONES.map(zone => ({ value: zone, label: zone }))}
                />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="offset-sm-2 col-sm-10">
                <SubmitButton disabled />
              </div>
            </FormGroup>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
        <Card title="Change email">
          <Form onSubmit={this.emailOnSubmit}>
            <FormGroup className="row" errors={errors} name="email">
              <label htmlFor="email" className="col-sm-2 col-form-label">Email:</label>
              <div className="col-sm-10">
                <Input
                  type="email"
                  name="email"
                  onChange={this.inputOnChange}
                  value={email}
                />
                <FormGroupError errors={errors} name="email" />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="offset-sm-2 col-sm-10">
                <SubmitButton disabled />
              </div>
            </FormGroup>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
      </div>
    );
  }
}
