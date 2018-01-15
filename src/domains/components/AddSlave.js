import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import Input from 'linode-components/dist/forms/Input';
import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import Textarea from 'linode-components/dist/forms/Textarea';
import { onChange } from 'linode-components/dist/forms/utilities';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class AddSlave extends Component {
  static title = 'Add a Slave Domain'

  static trigger(dispatch) {
    return dispatch(showModal(AddSlave.title, (
      <AddSlave
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      domain: '',
      ips: '',
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { domain, ips } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.domains.post({ domain, master_ips: ips.split(';'), type: 'slave' }),
      () => push(`/domains/${domain}`),
    ]));
  }

  render() {
    const { close } = this.props;
    const { errors, domain, ips } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Add Domain"
        buttonDisabledText="Adding Domain"
        analytics={{ title: AddSlave.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup label="Domain" errors={errors} id="domain" apiKey="domain">
            <Input
              name="domain"
              value={domain}
              placeholder="mydomain.net"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Master Zones" errors={errors} id="ips" apiKey="master_ips">
            <Textarea
              name="ips"
              value={ips}
              placeholder="172.92.1.4;209.124.103.15"
              onChange={this.onChange}
            />
            <div>
              <small className="text-muted">
                Use semicolons to separate multiple IP addresses.
              </small>
            </div>
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddSlave.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
