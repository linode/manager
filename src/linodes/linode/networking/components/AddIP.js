import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { addIP } from '~/api/networking';
import { dispatchOrStoreErrors } from '~/api/util';
import { MONTHLY_IP_COST } from '~/constants';


export default class AddIP extends Component {
  static title = 'Add an IP Address'

  static trigger(dispatch, linode) {
    return dispatch(showModal(AddIP.title, (
      <AddIP
        dispatch={dispatch}
        linode={linode}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {} };
  }

  onSubmit = () => {
    const { dispatch, linode, close } = this.props;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => addIP(linode.id, 'public'),
      close,
    ]));
  }

  render() {
    const { close } = this.props;
    const { errors } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Add IP Address"
        buttonDisabledText="Adding IP Address"
        analytics={{ title: AddIP.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <p>
            You will incur a ${MONTHLY_IP_COST}/month charge for each additional public IPv4.
            To request more IPv6 addresses, you'll have to <Link to="/support/create">create a
            ticket</Link>.
          </p>
          <ModalFormGroup label="Version">
            <Input disabled value="IPv4" />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddIP.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
};
