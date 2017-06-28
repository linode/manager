import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Form,
  FormSummary,
  SubmitButton,
} from 'linode-components/forms';

import { showModal } from '~/actions/modal';
import { TrackEvent } from '~/actions/trackEvent.js';
import { toggleTFA } from '~/api/profile';
import { dispatchOrStoreErrors } from '~/api/util';

import { TwoFactorModal } from './TwoFactorModal';


export default class TwoFactor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tfaCode: '',
      errors: {},
      loading: false,
    };
  }

  onSubmit = () => {
    const { dispatch, tfaEnabled } = this.props;

    const requests = [() => toggleTFA(!tfaEnabled)];
    if (!tfaEnabled) {
      requests.push(({ secret }) => this.twoFactorModal(secret));
    }

    TrackEvent('Submit', tfaEnabled ? 'Disable' : 'Enable', 'Two Factor');
    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  twoFactorModal(secret) {
    return (dispatch) => dispatch(showModal('Enable Two-Factor Authentication', (
      <TwoFactorModal
        dispatch={dispatch}
        secret={secret}
        username={this.props.username}
      />
    )));
  }

  render() {
    const { tfaEnabled } = this.props;
    const { errors, loading } = this.state;
    const header = <CardHeader title="Change Two-Factor Authentication" />;

    return (
      <Card header={header}>
        <Form onSubmit={this.onSubmit}>
          <p>
            Two-factor authentication (TFA) is
            currently <strong>{tfaEnabled ? 'enabled' : 'disabled'}</strong>.
          </p>
          <SubmitButton
            disabled={loading}
            disabledChildren={tfaEnabled ? 'Disabling' : 'Enabling'}
          >
            {tfaEnabled ? 'Disable' : 'Enable'}
          </SubmitButton>
          <FormSummary errors={errors} />
        </Form>
      </Card>
    );
  }
}

TwoFactor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  tfaEnabled: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
};
