import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { hideModal } from '~/actions/modal';
import { nodebalancers } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { CancelButton } from 'linode-components/buttons';
import {
  Form,
  FormSummary,
  ModalFormGroup,
  Input,
  Select,
  SubmitButton,
} from 'linode-components/forms';


export class NodeModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.node.id,
      label: this.props.node.label,
      address: this.props.node.address,
      weight: this.props.node.weight,
      mode: this.props.node.mode,
      errors: {},
      loading: false,
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
    const { dispatch } = this.props;
    const { label, address, weight, mode, errors, loading } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
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
          >
            <option value="accept">Accept</option>
            <option value="reject">Reject</option>
            <option value="drain">Drain</option>
          </Select>
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton disabled={loading} onClick={() => dispatch(hideModal())} />
          <SubmitButton disabled={loading} />
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

NodeModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  confirmText: PropTypes.string.isRequired,
  node: PropTypes.object,
  configId: PropTypes.number.isRequired,
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

export default connect()(NodeModal);

