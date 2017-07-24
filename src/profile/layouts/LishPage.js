import React, { Component } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  SubmitButton,
  Select,
} from 'linode-components/forms';


export default class LishPage extends Component {
  constructor() {
    super();

    this.state = {
      authorization: '',
      keys: '',
      errors: {},
      loading: false,
    };
  }

  onSubmit = () => {
    // TODO: implement save
  }

  render() {
    const { errors, loading, authorization, keys } = this.state;

    const title = 'Change Lish Settings';

    return (
      <div>
        <Card header={<CardHeader title={title} />}>
          <Form
            onSubmit={this.onSubmit}
            analytics={{ title }}
          >
            <FormGroup className="row" errors={errors} name="mode">
              <label htmlFor="authorization" className="col-sm-2 col-form-label">
                Authorization mode
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
                <SubmitButton disabled={loading} />
                <FormSummary errors={errors} success="Lish settings saved." />
              </div>
            </FormGroup>
          </Form>
        </Card>
      </div>
    );
  }
}
