import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import { Input, ModalFormGroup } from 'linode-components';
import { onChange } from 'linode-components';
import { FormModalBody } from 'linode-components';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
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
    const { dispatch } = this.props;
    const { label, region } = this.state;

    const data = {
      label,
      region,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.nodebalancers.post(data),
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
          <ModalFormGroup label="Label" id="label-group" apiKey="label" errors={errors}>
            <Input
              placeholder="my-nodebalancer"
              value={label}
              name="label"
              id="label"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Region" id="region-group" apiKey="region" errors={errors}>
            <RegionSelect
              value={region}
              name="region"
              id="region"
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Plan" id="node-balancer">
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
