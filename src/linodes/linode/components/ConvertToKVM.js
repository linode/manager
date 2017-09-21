import React, { Component, PropTypes } from 'react';

import { FormModalBody } from 'linode-components/modals';
import { showModal, hideModal } from '~/actions/modal';
import { kvmifyLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';


export default class ConvertToKVM extends Component {
  static title = 'Convert to KVM';
  static trigger(dispatch, linode) {
    return dispatch(showModal(ConvertToKVM.title, (
      <ConvertToKVM
        dispatch={dispatch}
        linode={linode}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {} };
  }

  render() {
    const { dispatch, linode } = this.props;
    const { errors } = this.state;

    return (
      <FormModalBody
        onSubmit={() => dispatch(dispatchOrStoreErrors.call(this, [
          () => kvmifyLinode(linode.id),
          hideModal,
        ]))}
        onCancel={() => dispatch(hideModal())}
        analytics={{ title: ConvertToKVM.title }}
        errors={errors}
      >
        <div>
          <p>
            Are you sure you want to <strong>permanently</strong> convert {linode.label} to KVM?
          </p>
        </div>
      </FormModalBody>
    );
  }
}

ConvertToKVM.propTypes = {
  linode: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
