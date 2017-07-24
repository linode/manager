import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormSummary, SubmitButton } from 'linode-components/forms';

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
    const { dispatch, tfaEnabled, username } = this.props;

    const requests = [() => toggleTFA(!tfaEnabled)];
    if (!tfaEnabled) {
      requests.push(({ secret }) => TwoFactorModal.trigger(dispatch, secret, username));
    }

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  render() {
    const { tfaEnabled } = this.props;
    const { errors, loading } = this.state;

    const title = 'Change Two-Factor Authentication';
    const header = <CardHeader title={title} />;

    return (
      <Card header={header}>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title }}
        >
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
