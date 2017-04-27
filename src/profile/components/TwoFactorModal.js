import React, { Component, PropTypes } from 'react';
import QRious from 'qrious';

import { ConfirmModalBody } from 'linode-components/modals';
import { showModal, hideModal } from '~/actions/modal';
import { confirmTFA } from '~/api/account';
import {
  FormGroup, FormGroupError, Input,
} from 'linode-components/forms';
import { ErrorSummary, reduceErrors } from '~/errors';

export class TwoFactorModal extends Component {
  constructor(props) {
    super(props);

    this.twoFactorConfirm = this.twoFactorConfirm.bind(this);
    this.twoFactorScratchModal = this.twoFactorScratchModal.bind(this);
    this.state = {
      tfaCode: '',
      errors: {},
    };
  }

  async twoFactorConfirm() {
    const { dispatch, toggleTwoFactor } = this.props;
    const { tfaCode } = this.state;

    try {
      const tfaResponse = await dispatch(confirmTFA(tfaCode));
      toggleTwoFactor();
      this.twoFactorScratchModal(tfaResponse.scratch);
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors: errors });
    }
  }

  twoFactorScratchModal(scratch) {
    const { dispatch } = this.props;
    dispatch(showModal('Scratch code generated',
      <ConfirmModalBody
        buttonText="Ok"
        onOk={() => dispatch(hideModal())}
        onCancel={() => dispatch(hideModal())}
      >
        <FormGroup>
          <div>
            A new emergency one-time use scratch code has been generated.
          </div>
          <div>
            Store this somewhere safe.
          </div>
        </FormGroup>
        <FormGroup className="row">
          <div className="col-sm-8">
            <div className="alert alert-warning">{scratch}</div>
          </div>
        </FormGroup>
      </ConfirmModalBody>
    ));
  }

  render() {
    const { dispatch, secret, profile } = this.props;
    const { tfaCode, errors } = this.state;
    const QRcode = new QRious({
      value: `otpauth://totp/LinodeManager%3A${profile.username}?secret=${secret}`,
      level: 'H',
      size: 250,
    });

    return (
      <div>
        <ConfirmModalBody
          buttonText="Two-factor Authentication"
          onOk={async () => {
            await this.twoFactorConfirm();
            if (errors === {}) {
              dispatch(hideModal());
            }
          }}
          onCancel={() => dispatch(hideModal())}
        >
          <FormGroup>
            Scan this QR code to add your Linode account to your TFA app.
          </FormGroup>
          <FormGroup className="row">
            <div className="col-sm-12 qrcode">
              <img
                src={QRcode.toDataURL()}
                alt={secret}
              />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="col-sm-12">
              <FormGroup>
                If your TFA app does not have a QR scanner, you can use this secret key.
              </FormGroup>
              <div className="alert alert-warning">{secret}</div>
            </div>
          </FormGroup>
          <FormGroup>
            Please enter your two-factor authentication token.
          </FormGroup>
          <FormGroup errors={errors} className="row" name="tfa_code">
            <div className="col-sm-4">
              Token:
            </div>
            <div className="col-sm-8">
              <Input
                value={tfaCode}
                onChange={e => this.setState({ tfaCode: e.target.value })}
              />
              <div>
                <small className="text-muted">
                  You may use a scratch code if necessary.
                </small>
              </div>
              <FormGroupError errors={errors} name="tfa_code" />
            </div>
          </FormGroup>
        </ConfirmModalBody>
        <ErrorSummary errors={errors} />
      </div>
    );
  }
}

TwoFactorModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  toggleTwoFactor: PropTypes.func,
  secret: PropTypes.string,
  profile: PropTypes.object,
};
