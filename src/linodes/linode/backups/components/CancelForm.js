import React, { Component, PropTypes } from 'react';

import { ConfirmModalBody } from 'linode-components/modals';
import { Form, FormSummary, SubmitButton } from 'linode-components/forms';

import { cancelBackup } from '~/api/backups';
import { showModal, hideModal } from '~/actions/modal';
import { dispatchOrStoreErrors } from '~/api/util';
import { TrackEvent } from '~/actions/trackEvent.js';


export default class CancelForm extends Component {
  constructor(props) {
    super(props);

    this.state = { loading: false, errors: {} };
  }

  onOk = () => {
    const { linode, dispatch } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => cancelBackup(linode.id),
      hideModal,
    ]));
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const title = 'Cancel Backups Service';

    dispatch(showModal(title, (
      <ConfirmModalBody
        onOk={() => {
          TrackEvent('Modal', 'Cancel backups service', title);
          this.onOk();
        }}
        onCancel={() => {
          TrackEvent('Modal', 'cancel', title);
          dispatch(hideModal());
        }}
        buttonText="Cancel backups service"
        buttonDisabledText="Cancelling backups service"
      >
        Are you sure you want to cancel the backups service for this Linode? This cannot be undone.
      </ConfirmModalBody>
    )));
  }

  render() {
    const { loading, errors } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <p>This will remove all existing backups.</p>
        <SubmitButton
          className="btn btn-default"
          disabled={loading}
          disabledChildren="Cancelling backups service"
        >Cancel backups service</SubmitButton>
        <FormSummary errors={errors} />
      </Form>
    );
  }
}

CancelForm.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
