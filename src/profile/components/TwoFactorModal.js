import React, { Component, PropTypes } from 'react';

import { ConfirmModalBody } from '~/components/modals';
import { showModal, hideModal } from '~/actions/modal';
import { confirmTFA } from '~/api/account';
import {
  FormGroup, FormGroupError, Input,
} from '~/components/form';
import { reduceErrors } from '~/errors';

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
    dispatch(showModal('Scratch Code',
      <ConfirmModalBody
        buttonText="Finished"
        onOk={() => dispatch(hideModal())}
        onCancel={() => dispatch(hideModal())}
      >
        <div className="form-group row">
          <div className="col-sm-8">
            <div className="alert alert-warning">{scratch}</div>
          </div>
        </div>
      </ConfirmModalBody>
    ));
  }

  render() {
    const { dispatch } = this.props;
    const { tfaCode, errors } = this.state;

    return (
      <ConfirmModalBody
        buttonText="Authenticate"
        onOk={() => {
          dispatch(hideModal());
          this.twoFactorConfirm();
        }}
        onCancel={() => dispatch(hideModal())}
      >
        <FormGroup errors={errors} className="row" name="tfaCode">
          <div className="col-sm-4">
            Two Factor Code
          </div>
          <div className="col-sm-8">
            <Input
              value={tfaCode}
              onChange={e => this.setState({ tfaCode: e.target.value })}
            />
            <div>
              <small className="text-muted">
                Enter the 6 digit authentication code.
              </small>
            </div>
            <FormGroupError errors={errors} name="tfaCode" />
          </div>
        </FormGroup>
      </ConfirmModalBody>
    );
  }
}

TwoFactorModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  toggleTwoFactor: PropTypes.func,
};
