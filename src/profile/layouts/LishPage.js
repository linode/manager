import React, { Component } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, FormGroupError, SubmitButton, Select } from 'linode-components/forms';
import { ErrorSummary } from '~/errors';

export default class NotificationsPage extends Component {
  constructor() {
    super();
    // TODO: grab lish settings from API
    this.state = {
      authorization: '',
      keys: '',
      errors: {},
    };
  }

  onSubmit = () => {
    // TODO: implement save
  }

  render() {
    const { errors, authorization, keys } = this.state;

    return (
      <div>
        <Card header={<CardHeader title="Change Lish settings" />}>
          <Form onSubmit={this.onSubmit}>
            <FormGroup className="row" errors={errors} name="mode">
              <label htmlFor="authorization" className="col-sm-2 col-form-label">
                Authorization mode:
              </label>
              <div className="col-sm-10">
                <Select
                  id="authorization"
                  name="authorization"
                  onChange={mode => this.setState({ authorization: mode })}
                  value={authorization}
                >
                  <option value="0">Allow both password and key authorization</option>
                  <option value="1">Allow key authentication only</option>
                  <option value="2">Disable Lish</option>
                </Select>
                <FormGroupError errors={errors} name="mode" />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="keys">
              <label htmlFor="keys" className="col-sm-2 col-form-label">Lish keys:</label>
              <div className="col-sm-10">
                <textarea id="keys" className="textarea-md" name="keys" value={keys}></textarea>
                <div>
                  <small className="text-muted">
                    Place your SSH public keys here for use with Lish console access.
                  </small>
                </div>
                <FormGroupError errors={errors} name="keys" />
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
