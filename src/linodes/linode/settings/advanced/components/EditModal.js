import React, { Component, PropTypes } from 'react';

import { CancelButton } from 'linode-components/buttons';
import {
  Form,
  FormSummary,
  ModalFormGroup,
  Input,
  SubmitButton,
} from 'linode-components/forms';

import { hideModal } from '~/actions/modal';
import { linodes } from '~/api';
import { resizeLinodeDisk } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';
import { TrackEvent } from '~/actions/trackEvent.js';


export class EditModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      size: props.disk.size,
      label: props.disk.label,
      loading: false,
      errors: {},
    };
  }

  onSubmit = () => {
    const { size, label } = this.state;
    const { linode, disk, title, dispatch } = this.props;

    const requests = [
      () => TrackEvent('Modal', 'edit', title),
      hideModal,
    ];
    if (size !== disk.size) {
      requests.unshift(() => resizeLinodeDisk(linode.id, disk.id, parseInt(size)));
    }

    if (label !== disk.label) {
      requests.unshift(() => linodes.disks.put({ label }, linode.id, disk.id));
    }

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { disk, free, title, dispatch } = this.props;
    const { label, size, errors, loading } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup errors={errors} id="label" label="Label" apiKey="label">
          <Input
            id="label"
            name="label"
            placeholder="Label"
            value={label}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup errors={errors} label="Format">
          <Input disabled value={disk.filesystem} />
        </ModalFormGroup>
        <ModalFormGroup errors={errors} label="Current Size">
          <Input disabled label="MB" value={disk.size} type="number" />
        </ModalFormGroup>
        <ModalFormGroup errors={errors} id="size" label="New Size" apiKey="size">
          <Input
            id="size"
            name="size"
            label="MB"
            type="number"
            value={size}
            min={8} /* TODO: can't/don't calculate distro min size requirement */
            max={free + disk.size}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton
            onClick={() => {
              TrackEvent('Modal', 'cancel', title);
              dispatch(hideModal());
            }}
          />
          <SubmitButton disabled={loading} />
          <FormSummary errors={errors} />
        </div>
      </Form>);
  }
}

EditModal.propTypes = {
  linode: PropTypes.object.isRequired,
  disk: PropTypes.object.isRequired,
  free: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
