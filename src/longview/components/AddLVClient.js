import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class AddLVClient extends Component {
  static title = 'Add a Longview Client'

  static trigger(dispatch) {
    return dispatch(showModal(AddLVClient.title, (
      <AddLVClient
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {} };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { label, region } = this.state;

    const data = {
      label,
      region,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.lvclients.post(data),
      ({ label }) => push(`/longview/clients/${label}`),
    ]));
  }

  render() {
    const { close } = this.props;
    const { errors, label } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Add Longview Client"
        buttonDisabledText="Adding Longview Client"
        analytics={{ title: AddLVClient.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup label="Label" id="label" apiKey="label" errors={errors}>
            <Input
              placeholder="my-longview-client"
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Plan">
            <Input value="Change Subscription dropdown ($20.00/mo)" />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddLVClient.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
