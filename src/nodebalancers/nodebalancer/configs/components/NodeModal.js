import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { hideModal } from '~/actions/modal';
import { ConfirmModalBody } from 'linode-components/modals';
import { nodebalancers } from '~/api';
import {
  ModalFormGroup, Input, Select,
} from 'linode-components/forms';
import { dispatchOrStoreErrors } from '~/components/forms';

export class NodeModal extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    const address = this.props.node.address.split(':');

    this.state = {
      id: this.props.node.id,
      label: this.props.node.label,
      address: address.length ? address[0] : address[0],
      port: address.length ? address[1] : address[0],
      weight: this.props.node.weight,
      mode: this.props.node.mode,
      errors: {},
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  async onSubmit(state) {
    const { dispatch, nodebalancerId, configId } = this.props;
    const data = {
      ...state,
      address: `${state.address}:${state.port}`,
      weight: +state.weight,
    };
    const ids = [nodebalancerId, configId, state.id].filter(Boolean);

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [
        () => nodebalancers.configs.nodes[state.id ? 'put' : 'post'](data, ...ids),
        () => dispatch(hideModal()),
      ],
    ]));
  }

  render() {
    const { dispatch } = this.props;
    const { label, address, port, weight, mode, errors } = this.state;

    return (
      <ConfirmModalBody
        buttonText={this.props.confirmText}
        onOk={async () => {
          await this.onSubmit(this.state);
        }}
        onCancel={() => dispatch(hideModal())}
      >
        <ModalFormGroup
          label="Label"
          id="label"
          apiKey="label"
          errors={errors}
        >
          <Input
            name="label"
            onChange={this.onChange}
            value={label}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Address"
          id="address"
          apiKey="address"
          errors={errors}
        >
          <Input
            name="address"
            onChange={this.onChange}
            value={address}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Port"
          id="port"
          apiKey="port"
          errors={errors}
        >
          <Input
            name="port"
            onChange={this.onChange}
            value={port}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Weight"
          description="Define a weight to be used in determining how
            connections are balanced to this node."
          id="weight"
          apiKey="weight"
          errors={errors}
        >
          <Input
            name="weight"
            onChange={this.onChange}
            value={weight}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Mode"
          description="Configure how this node handles incoming connections
            based on it's health."
          id="mode"
          apiKey="mode"
          errors={errors}
        >
          <Select
            id="mode"
            name="mode"
            onChange={this.onChange}
            value={mode}
          >
            <option value="accept">Accept</option>
            <option value="reject">Reject</option>
            <option value="drain">Drain</option>
          </Select>
        </ModalFormGroup>
      </ConfirmModalBody>
    );
  }
}

NodeModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  confirmText: PropTypes.string.isRequired,
  node: PropTypes.object,
  configId: PropTypes.string.isRequired,
  nodebalancerId: PropTypes.number.isRequired,
};

NodeModal.defaultProps = {
  node: {
    id: '',
    label: '',
    address: '',
    weight: '',
    mode: 'accept',
  },
};

function select() {
  return;
}

export default connect(select)(NodeModal);

