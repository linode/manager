import React, { Component, PropTypes } from 'react';
import QRious from 'qrious';

import { ConfirmModalBody } from '~/components/modals';
import { showModal, hideModal } from '~/actions/modal';
import { Card, CardHeader } from '~/components/cards';
import {
  enableTFA,
  disableTFA,
} from '~/api/account';
import {
  Form, SubmitButton,
} from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { TwoFactorModal } from './TwoFactorModal';

export class TwoFactorPanel extends Component {
  constructor(props) {
    super(props);

    this.twoFactorAction = this.twoFactorAction.bind(this);
    this.twoFactorQrModal = this.twoFactorQrModal.bind(this);
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
        this.twoFactorQrModal(tfaResponse);
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

  twoFactorQrModal({ secret }) {
    const { dispatch } = this.props;
    const QRcode = new QRious({
      value: secret,
      level: 'H',
      size: 170,
    });

    dispatch(showModal('Enable Two Factor',
      <ConfirmModalBody
        buttonText="Next"
        onOk={() => {
          dispatch(hideModal());
          dispatch(showModal('Enable two-factor authentication',
            <TwoFactorModal
              toggleTwoFactor={this.toggleTwoFactor}
              dispatch={this.props.dispatch}
            />
          ));
        }}
        onCancel={() => dispatch(hideModal())}
      >
        <div className="form-group row">
          <div className="col-sm-12">
            Scan this QR code to add your Linode account to your TFA app.
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-12 qrcode">
            <img
              src={QRcode.toDataURL()}
              alt={secret}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-12">
            <div className="form-group">
              If your TFA app does not have a QR scanner, you can use this secret key.
            </div>
            <div className="alert alert-warning">{secret}</div>
          </div>
        </div>
      </ConfirmModalBody>
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
          <ErrorSummary errors={errors} />
        </Form>
      </Card>
    );
  }
}

TwoFactorPanel.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profile: PropTypes.object,
};
