import React, { Component } from 'react';

import { Card, CardHeader } from '~/components/cards';
import { Form, SubmitButton } from '~/components/form';
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
            <SubmitButton disabled>Disable</SubmitButton>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
      </div>
    );
  }
}
