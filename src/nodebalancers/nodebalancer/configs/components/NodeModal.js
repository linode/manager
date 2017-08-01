import React, { Component, PropTypes } from 'react';

import { ModalFormGroup, Input, Select } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { nodebalancers } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';


export default class NodeModal extends Component {
  // For some reason NodeModal.trigger only recognizes when the defaultProps
  // are listed like this.
  static defaultProps = {
    node: {
      id: '',
      label: '',
      address: '',
      weight: '',
      mode: 'accept',
    },
  }

  static trigger(dispatch, nodebalancer, config, node) {
    const title = node ? 'Edit Node' : 'Add a Node';

    dispatch(showModal(title, (
      <NodeModal
        dispatch={dispatch}
        configId={config.id}
        nodebalancerId={nodebalancer.id}
        title={title}
        node={node}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      id: props.node.id,
      label: props.node.label,
      address: props.node.address,
      weight: props.node.weight,
      mode: props.node.mode,
      errors: {},
    };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = () => {
    const { dispatch, nodebalancerId, configId } = this.props;
    const state = this.state;
    const data = {
      label: state.label,
      address: state.address,
      weight: +state.weight,
      mode: state.mode,
    };
    const ids = [nodebalancerId, configId, state.id].filter(Boolean);

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => nodebalancers.configs.nodes[state.id ? 'put' : 'post'](data, ...ids),
      hideModal,
    ]));
  }

  render() {
    const { dispatch, title } = this.props;
    const { id, label, address, weight, mode, errors } = this.state;

    const modeOptions = [
      { value: 'accept', label: 'Accept' },
      { value: 'reject', label: 'Reject' },
      { value: 'drain', label: 'Drain' },
    ];

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={() => dispatch(hideModal())}
        buttonText={id ? undefined : 'Add Node'}
        buttonDisabledText={id ? undefined : 'Adding Node'}
        analytics={{ title, action: id ? 'edit' : 'add' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup
            label="Label"
            id="label"
            apiKey="label"
            errors={errors}
          >
            <Input
              name="label"
              id="label"
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
              id="address"
              placeholder="192.168.1.10:80"
              onChange={this.onChange}
              value={address}
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
              id="weight"
              type="number"
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
              options={modeOptions}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

NodeModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  configId: PropTypes.number.isRequired,
  nodebalancerId: PropTypes.number.isRequired,
  node: PropTypes.object,
};
