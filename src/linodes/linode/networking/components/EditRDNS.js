import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components';
import { onChange } from 'linode-components';
import { FormModalBody } from 'linode-components';

import { showModal, hideModal } from '~/actions/modal';
import { setRDNS } from '~/api/ad-hoc/networking';
import { dispatchOrStoreErrors } from '~/api/util';


export default class EditRDNS extends Component {
  static title = 'Edit RDNS Entry'

  static trigger(dispatch, ip, linodeId) {
    return dispatch(showModal(EditRDNS.title, (
      <EditRDNS
        ip={ip}
        linodeId={linodeId}
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      hostname: props.ip.rdns || '',
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, ip, linodeId, close } = this.props;
    const { hostname } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setRDNS(ip, linodeId, hostname),
      close,
    ]));
  }

  render() {
    const { close, ip: { address } } = this.props;
    const { errors, hostname } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        analytics={{ title: EditRDNS.title }}
        errors={errors}
      >
        <p>
          This request may take a while.
        </p>
        <ModalFormGroup label="IP Address" id="address">
          <Input
            id="address"
            value={address}
            disabled
          />
        </ModalFormGroup>
        <ModalFormGroup label="Hostname" id="hostname" apiKey="rdns" errors={errors}>
          <Input
            id="hostname"
            name="hostname"
            value={hostname}
            placeholder="www.example.com"
            onChange={this.onChange}
          />
        </ModalFormGroup>
      </FormModalBody>
    );
  }
}

EditRDNS.propTypes = {
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  ip: PropTypes.object.isRequired,
  linodeId: PropTypes.number.isRequired,
  close: PropTypes.func.isRequired,
};
