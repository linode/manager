import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ModalFormGroup, Input } from 'linode-components';
import { onChange } from 'linode-components';
import { FormModalBody } from 'linode-components';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { resizeLinodeDisk } from '~/api/ad-hoc/linodes';
import { dispatchOrStoreErrors } from '~/api/util';


export default class EditDisk extends Component {
  static title = 'Edit Disk'

  static trigger(dispatch, linode, disk, free) {
    return dispatch(showModal(EditDisk.title, (
      <EditDisk
        dispatch={dispatch}
        free={free}
        linode={linode}
        disk={disk}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = {
      size: props.disk.size,
      label: props.disk.label,
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { size, label } = this.state;
    const { linode, disk, dispatch } = this.props;

    const requests = [hideModal];
    if (size !== disk.size) {
      requests.unshift(() => resizeLinodeDisk(linode.id, disk.id, parseInt(size)));
    }

    if (label !== disk.label) {
      requests.unshift(() => api.linodes.disks.put({ label }, linode.id, disk.id));
    }

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  render() {
    const { disk, free, dispatch } = this.props;
    const { label, size, errors } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={() => dispatch(hideModal())}
        analytics={{ title: EditDisk.title }}
        errors={errors}
      >
        <div>
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
        </div>
      </FormModalBody>
    );
  }
}

EditDisk.propTypes = {
  linode: PropTypes.object.isRequired,
  disk: PropTypes.object.isRequired,
  free: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};
