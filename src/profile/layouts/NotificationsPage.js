import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components';
import {
  Form,
  FormSummary,
  SubmitButton,
} from 'linode-components';

import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';


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
      () => api.profile.put({ email_notifications: !enabled }),
    ]));
  }

  render() {
    const { enabled } = this.props;
    const { errors, loading } = this.state;

    const prefix = enabled ? 'enabl' : 'disabl';
    const reversePrefix = enabled ? 'Disabl' : 'Enabl';

    return (
      <div>
        <ChainedDocumentTitle title="Notifications" />
        <Card header={<CardHeader title="Change email settings" />}>
          <Form
            onSubmit={this.onSubmit}
            analytics={{ title: 'Notifications Settings' }}
          >
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
