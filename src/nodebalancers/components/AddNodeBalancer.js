import React, { PropTypes, Component } from 'react';
import { push } from 'react-router-redux';

import { ExternalLink } from 'linode-components/buttons';
import { Input, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { nodebalancers } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import { RegionSelect } from '../../components';


export default class AddNodeBalancer extends Component {
  static title = 'Add a NodeBalancer'

  static trigger(dispatch) {
    return dispatch(showModal(AddNodeBalancer.title, (
      <AddNodeBalancer
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {}, password: '' };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, close } = this.props;
    const { label, region } = this.state;

    const data = {
      label,
      region,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => nodebalancers.post(data),
      ({ label }) => push(`/nodebalancers/${label}`),
    ]));
  }

  render() {
    const { close } = this.props;
    const { errors, label, region } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Add NodeBalancer"
        buttonDisabledText="Adding NodeBalancer"
        analytics={{ title: AddNodeBalancer.title, action: 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup label="Label" id="label" apiKey="label" errors={errors}>
            <Input
              placeholder="my-nodebalancer"
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Region" id="region" apiKey="region" errors={errors}>
            <RegionSelect
              value={region}
              name="region"
              id="region"
              onChange={this.onChange}
            />
            <small className="text-muted">
              <ExternalLink to="https://www.linode.com/speedtest">Learn more</ExternalLink>
            </small>
          </ModalFormGroup>
          <ModalFormGroup label="Plan">
            <Input disabled value="NodeBalancer ($20.00/mo)" />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddNodeBalancer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};
