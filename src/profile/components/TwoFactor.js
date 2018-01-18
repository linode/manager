import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import Form from 'linode-components/dist/forms/Form';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';

import { toggleTFA } from '~/api/ad-hoc/profile';
import { dispatchOrStoreErrors } from '~/api/util';
import { PortalModal } from '~/components/modal';

import { TwoFactorModal } from './TwoFactorModal';
import { hideModal } from '~/utilities';


export default class TwoFactor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tfaCode: '',
      errors: {},
      loading: false,
      modal: null,
    };

    this.hideModal = hideModal.bind(this);
  }

  onSubmit = () => {
    const { dispatch, tfaEnabled } = this.props;

    const requests = [() => toggleTFA(!tfaEnabled)];
    if (!tfaEnabled) {
      requests.push(({ secret }) => this.twoFactorModal(secret));
    }

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  twoFactorModal = (secret) => {
    this.setState({
      modal: {
        name: 'twoFactor',
        title: TwoFactorModal.title,
        secret: secret,
      },
    });
  }

  renderModal = () => {
    const { dispatch, username } = this.props;
    if (!this.state.modal) {
      return null;
    }
    const { name, title, secret } = this.state.modal;
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'twoFactor') &&
          <TwoFactorModal
            dispatch={dispatch}
            secret={secret}
            username={username}
            close={this.hideModal}
          />
        }
      </PortalModal>
    );
  }

  render() {
    const { tfaEnabled } = this.props;
    const { errors, loading } = this.state;

    const title = 'Change Two-Factor Authentication';
    const header = <CardHeader title={title} />;

    return (
      <Card header={header}>
        {this.renderModal()}
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
