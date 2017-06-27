import React, { PropTypes, Component } from 'react';

import { CancelButton } from 'linode-components/buttons';
import {
  Form,
  FormSummary,
  Input,
  ModalFormGroup,
  SubmitButton,
} from 'linode-components/forms';

import { showModal, hideModal } from '~/actions/modal';
import { setRDNS } from '~/api/networking';
import { dispatchOrStoreErrors } from '~/api/util';
import { EmitEvent } from 'linode-components/utils';


export default class EditRDNS extends Component {
  static trigger(dispatch, ip) {
    return dispatch(showModal('Edit RDNS Entry', (
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
    const { dispatch, ip, title, close } = this.props;
    const { hostname } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => setRDNS(ip, hostname),
      () => { EmitEvent('modal:submit', 'Modal', 'edit', title) },
      close,
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close, ip: { address }, title } = this.props;
    const { errors, loading, hostname } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
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
        <div className="Modal-footer">
          <CancelButton
            onClick={() => {
              EmitEvent('modal:cancel', 'Modal', 'cancel', title);
              close();
            }}
          />
          <SubmitButton disabled={loading} />
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

EditRDNS.propTypes = {
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  ip: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
};
