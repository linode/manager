import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, SubmitButton } from 'linode-components/forms';

import { showModal } from '~/actions/modal';
import { enableTFA, disableTFA } from '~/api/account';
import { reduceErrors, FormSummary } from '~/components/forms';

import { TwoFactorModal } from './TwoFactorModal';


export default class TwoFactor extends Component {
  constructor(props) {
    super(props);

    this.twoFactorAction = this.twoFactorAction.bind(this);
    this.toggleTwoFactor = this.toggleTwoFactor.bind(this);
    this.state = {
      tfaCode: '',
      twoFactor: props.profile.two_factor_auth === 'enabled',
      errors: {},
    };
  }

  toggleTwoFactor() {
    const { twoFactor } = this.state;
    this.setState({
      twoFactor: !twoFactor,
    });
  }

  async twoFactorAction() {
    const { dispatch } = this.props;
    const { twoFactor } = this.state;
    let tfaResponse = {};

    try {
      if (twoFactor) {
        tfaResponse = await dispatch(disableTFA());
        this.toggleTwoFactor();
      } else {
        tfaResponse = await dispatch(enableTFA());
        this.twoFactorModal(tfaResponse);
      }
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors: errors });
    }
  }

  twoFactorModal({ secret }) {
    const { dispatch } = this.props;
    dispatch(showModal('Enable two-factor authentication',
      <TwoFactorModal
        toggleTwoFactor={this.toggleTwoFactor}
        dispatch={this.props.dispatch}
        secret={secret}
        profile={this.props.profile}
      />
    ));
  }

  render() {
    const { twoFactor, errors } = this.state;
    return (
      <Card header={<CardHeader title="Change two-factor authentication setting" />}>
        <Form onSubmit={this.twoFactorAction}>
          <p>
            Two-factor authentication (TFA) is currently {twoFactor ? 'enabled' : 'disabled'}.
          </p>
          <SubmitButton>
            {twoFactor ? 'Disable' : 'Enable'}
          </SubmitButton>
          <FormSummary errors={errors} />
        </Form>
      </Card>
    );
  }
}

TwoFactor.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profile: PropTypes.object,
};
