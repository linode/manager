import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ModalFormGroup, Input, Select } from 'linode-components';
import { onChange } from 'linode-components';
import { FormModalBody } from 'linode-components';

import { showModal } from '~/actions/modal';
import api from '~/api';
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
      id: props.node && props.node.id,
      label: props.node && props.node.label,
      address: props.node && props.node.address,
      weight: props.node && props.node.weight,
      mode: props.node && props.node.mode,
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, nodebalancerId, configId, close } = this.props;
    const state = this.state;
    const data = {
      label: state.label,
      address: state.address,
      weight: +state.weight,
      mode: state.mode,
    };
    const ids = [nodebalancerId, configId, state.id].filter(Boolean);

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.nodebalancers.configs.nodes[state.id ? 'put' : 'post'](data, ...ids),
      close,
    ]));
  }

  render() {
    const { title, close } = this.props;
    const { id, label, address, weight, mode, errors } = this.state;

    const modeOptions = [
      { value: 'accept', label: 'Accept' },
      { value: 'reject', label: 'Reject' },
      { value: 'drain', label: 'Drain' },
    ];

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
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
  configId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  nodebalancerId: PropTypes.number.isRequired,
  node: PropTypes.object,
  close: PropTypes.func.isRequired,
};
