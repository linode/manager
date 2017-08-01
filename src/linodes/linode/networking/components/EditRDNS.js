import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { setRDNS } from '~/api/networking';
import { dispatchOrStoreErrors } from '~/api/util';


export default class EditRDNS extends Component {
  static title = 'Edit RDNS Entry'

  static trigger(dispatch, ip) {
    return dispatch(showModal(EditRDNS.title, (
      <EditRDNS
        ip={ip}
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
  }

  onSubmit = () => {
    const { dispatch, ip, close } = this.props;
    const { hostname } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setRDNS(ip, hostname),
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

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
  close: PropTypes.func.isRequired,
};
