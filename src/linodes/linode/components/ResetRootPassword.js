import React, { Component, PropTypes } from 'react';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, SubmitButton, Select, PasswordInput } from 'linode-components/forms';
import { ConfirmModalBody } from 'linode-components/modals';

import { resetPassword } from '~/api/linodes';
import { showModal, hideModal } from '~/actions/modal';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export default class ResetRootPassword extends Component {
  constructor(props) {
    super(props);

    this.nonSwapDisks = Object.values(props.linode._disks.disks).filter(
      (d) => d.filesystem !== 'swap');

    this.state = {
      errors: {},
      loading: false,
      password: '',
      disk: this.nonSwapDisks[0].id || '',
    };
  }

  onSubmit = async () => {
    const { password, disk } = this.state;
    const { dispatch, linode } = this.props;

    return await dispatch(dispatchOrStoreErrors.call(this, [
      () => resetPassword(linode.id, disk, password),
      () => this.setState({ password: '' }),
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmitConfirm = () => {
    const { dispatch } = this.props;

    const onOk = () => {
      dispatch(hideModal());
      this.onSubmit();
    };

    dispatch(showModal('Reset root password', (
      <ConfirmModalBody
        buttonText="Reset"
        children="Are you sure you want to reset the root password for this Linode?
                  This cannot be undone."
        onCancel={() => dispatch(hideModal())}
        onOk={onOk}
      />
    )));
  }

  render() {
    const { disk, loading, errors } = this.state;
    const { linode } = this.props;

    // TODO: not so much that the Linode must be powered off, but the disk must not be in use.
    // This is difficult to do until we have know the last booted config.
    const diskAvailable = linode.status !== 'offline';
    const disabled = !this.nonSwapDisks.length || diskAvailable;
    let disabledText = 'Linode does not have any disks eligible for password reset.';
    if (!diskAvailable) {
      disabledText = 'Linode must be powered off to reset the root password.';
    }

    const disabledMessage = !disabled ? null : (
      <div>
        <div className="alert alert-info">{disabledText}</div>
      </div>
    );

    const header = <CardHeader title="Reset root password" helpLink="http://example.org" />;

    return (
      <Card header={header}>
        <Form onSubmit={this.onSubmitConfirm}>
          <FormGroup className="row" errors={errors} field="disk">
            <label htmlFor="disk" className="col-sm-3 col-form-label">Disk</label>
            <div className="col-sm-9">
              <Select
                name="disk"
                id="disk"
                value={disk}
                onChange={this.onChange}
                disabled={disabled}
              >
                {this.nonSwapDisks.map(d => <option value={d.id} key={d.id}>{d.label}</option>)}
              </Select>
            </div>
          </FormGroup>
          <FormGroup className="row" errors={errors} field="password">
            <label htmlFor="password" className="col-sm-3 col-form-label">Password</label>
            <div className="col-sm-9">
              <PasswordInput
                id="password"
                name="password"
                value={this.state.password}
                onChange={this.onChange}
                disabled={disabled}
              />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="col-sm-9 offset-sm-3">
              <SubmitButton
                disabled={disabled || loading}
                disabledChildren={disabled ? 'Reset' : 'Resetting'}
              >Reset</SubmitButton>
              {disabledMessage}
              <FormSummary errors={errors} success="Password reset." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

ResetRootPassword.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
