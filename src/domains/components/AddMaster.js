import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import Input from 'linode-components/dist/forms/Input';
import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import { onChange } from 'linode-components/dist/forms/utilities';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class AddMaster extends Component {
  static title = 'Add a Master Domain'

  static trigger(dispatch, email) {
    return dispatch(showModal(AddMaster.title, (
      <AddMaster
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        email={email}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      domain: '',
      email: props.email,
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { domain, email } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.domains.post({ domain, soa_email: email, type: 'master' }),
      () => push(`/domains/${domain}`),
    ]));
  }

  render() {
    const { close } = this.props;
    const { errors, domain, email } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Add Domain"
        buttonDisabledText="Adding Domain"
        analytics={{ title: AddMaster.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup label="Domain" errors={errors} id="domain" apiKey="domain">
            <Input
              id="domain"
              name="domain"
              placeholder="mydomain.net"
              value={domain}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="SOA Email" errors={errors} id="email" apiKey="soa_email">
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={this.onChange}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddMaster.propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
};
