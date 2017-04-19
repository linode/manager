import React, { Component } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, SubmitButton } from 'linode-components/forms';
import { ErrorSummary } from '~/errors';

export default class NotificationsPage extends Component {
  constructor() {
    super();
    this.state = { errors: {} };
  }
  // TODO: grab notifications settings from API
  onSubmit = () => {
  }

  render() {
    const { errors } = this.state;

    return (
      <div>
        <Card header={<CardHeader title="Change email settings" />}>
          <Form onSubmit={this.onSubmit}>
            <p>Email notifications are currently enabled.</p>
            <SubmitButton disabled disabledChildren="Disable">Disable</SubmitButton>
            <FormSummary errors={errors} />
          </Form>
        </Card>
      </div>
    );
  }
}
