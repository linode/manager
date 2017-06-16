import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormSummary,
  SubmitButton,
} from 'linode-components/forms';

import { profile } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export class NotificationsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      loading: false,
    };
  }

  onSubmit = () => {
    const { dispatch, enabled } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => profile.put({ email_notifications: !enabled }),
    ]));
  }

  render() {
    const { enabled } = this.props;
    const { errors, loading } = this.state;

    const prefix = enabled ? 'enabl' : 'disabl';
    const reversePrefix = enabled ? 'Disabl' : 'Enabl';

    return (
      <div>
        <Card header={<CardHeader title="Change email settings" />}>
          <Form onSubmit={this.onSubmit}>
            <p>Email notifications are currently {prefix}ed.</p>
            <SubmitButton
              disabled={loading}
              disabledChildren={`${reversePrefix}ing`}
            >{reversePrefix}e</SubmitButton>
            <FormSummary
              errors={errors}
              success={`Email notifications ${prefix}ed.`}
            />
          </Form>
        </Card>
      </div>
    );
  }
}

NotificationsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,
};

function select(state) {
  return {
    enabled: state.api.profile.email_notifications,
  };
}

export default connect(select)(NotificationsPage);
