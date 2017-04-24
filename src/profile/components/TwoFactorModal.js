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
        <div className="form-group">
          <p>
            A new emergency one-time use scratch code has been generated.
          </p>
          <p>
            Store this somewhere safe.
          </p>
        </div>
        <div className="form-group row">
          <div className="col-sm-8">
            <div className="alert alert-warning">{scratch}</div>
          </div>
        </div>
      </ConfirmModalBody>
    ));
  }

  render() {
    const { dispatch, secret } = this.props;
    const { tfaCode, errors } = this.state;
    const QRcode = new QRious({
      value: secret,
      level: 'H',
      size: 170,
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
          <div className="form-group">
            Please enter your two-factor authentication token.
          </div>
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
};
