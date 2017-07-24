import React, { Component, PropTypes } from 'react';

import { Form, FormSummary, SubmitButton } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { cancelBackup } from '~/api/backups';
import { showModal, hideModal } from '~/actions/modal';
import { dispatchOrStoreErrors } from '~/api/util';


export default class CancelForm extends Component {
  constructor(props) {
    super(props);

    this.state = { loading: false, errors: {} };
  }

  onSubmit = () => {
    const { linode, dispatch } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => cancelBackup(linode.id),
      hideModal,
    ]));
  }

  confirm = () => {
    const { dispatch } = this.props;
    const title = 'Cancel Backups Service';

    dispatch(showModal(title, (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={() => dispatch(hideModal())}
        buttonText="Cancel backups service"
        buttonDisabledText="Cancelling backups service"
        analytics={{ title }}
      >
        Are you sure you want to cancel the backups service for this Linode? This cannot be undone.
      </FormModalBody>
    )));
  }

  render() {
    const { loading, errors } = this.state;

    return (
      <Form
        onSubmit={this.confirm}
        analytics={{ title: 'Cancel Backups Service' }}
      >
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
