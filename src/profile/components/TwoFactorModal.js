import QRious from 'qrious';
import React, { Component, PropTypes } from 'react';

import { ModalFormGroup, Input } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { confirmTFA } from '~/api/profile';
import { dispatchOrStoreErrors } from '~/api/util';


export class TwoFactorModal extends Component {
  static title = 'Enable Two-Factor Authentication'

  static trigger(dispatch, secret, username) {
    dispatch(showModal(TwoFactorModal.title, (
      <TwoFactorModal
        dispatch={dispatch}
        secret={secret}
        username={username}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      tfaCode: '',
      errors: {},
    };
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { tfaCode } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => confirmTFA(tfaCode),
      ({ scratch }) => this.twoFactorScratchModal(scratch),
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  twoFactorScratchModal(scratch) {
    const title = 'Two-Factor Authentication Enabled';

    return (dispatch) => dispatch(showModal(title,
      <FormModalBody
        buttonText="I understand"
        buttonDisabledText="I understand"
        onSubmit={() => dispatch(hideModal())}
        onCancel={() => dispatch(hideModal())}
        noCancel
        analytics={{ title }}
      >
        <div>
          <p>
            Two-Factor authentication has been enabled. And a new emergency one-time use scratch
            code has been generated. Store this somewhere safe.
          </p>
          <div className="alert alert-warning">{scratch}</div>
        </div>
      </FormModalBody>
    ));
  }

  render() {
    const { dispatch, secret, username } = this.props;
    const { tfaCode, errors } = this.state;
    const QRcode = new QRious({
      value: `otpauth://totp/LinodeManager%3A${username}?secret=${secret}`,
      level: 'H',
      size: 250,
    });

    return (
      <div className="TwoFactorModal">
        <FormModalBody
          buttonText="Enable"
          buttonDisabledText="Enabling"
          onSubmit={this.onSubmit}
          onCancel={() => dispatch(hideModal())}
          analytics={{ title: TwoFactorModal.title }}
          errors={errors}
        >
          <div>
            <p>Scan this QR code to add your Linode account to your TFA app.</p>
            <div className="text-sm-center">
              <img src={QRcode.toDataURL()} alt={secret} />
            </div>
            <p>Please enter the token generated by your TFA app.</p>
            <ModalFormGroup errors={errors} id="tfaCode" name="tfa_code" label="Token">
              <Input
                id="tfaCode"
                name="tfaCode"
                value={tfaCode}
                placeholder="901928"
                autoComplete="off"
                autoFocus
                onChange={this.onChange}
              />
            </ModalFormGroup>
            <small>
              If your TFA app does not have a QR scanner, you can use this secret key.
            </small>
            <div className="alert alert-warning">{secret}</div>
          </div>
        </FormModalBody>
      </div>
    );
  }
}

TwoFactorModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  secret: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};
