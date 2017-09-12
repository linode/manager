import React, { PropTypes, Component } from 'react';

import { Input, ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { resizeVolume } from '~/api/volumes';
import { dispatchOrStoreErrors } from '~/api/util';


export default class ResizeVolume extends Component {
  static title = 'Resize Volume';

  static trigger(dispatch, volume) {
    return dispatch(showModal(this.title, (
      <ResizeVolume
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        volume={volume}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {}, size: props.volume.size };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, close, volume } = this.props;
    const { size } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => resizeVolume(volume.id, +size),
      close,
    ]));
  }

  render() {
    const { close, volume: { size: originalSize } } = this.props;
    const { errors, size } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Resize Volume"
        buttonDisabledText="Resizing Volume"
        analytics={{ title: this.title, action: 'resize' }}
        errors={errors}
      >
        <div>
          <ModalFormGroup label="Current Size">
            <Input
              label="GiB"
              value={originalSize}
              type="number"
              disabled
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup label="Size" id="size" apiKey="size" errors={errors}>
            <Input
              label="GiB"
              value={size}
              name="size"
              type="number"
              onChange={this.onChange}
            />
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

ResizeVolume.propTypes = {
  dispatch: PropTypes.func.isRequired,
  volume: PropTypes.object,
  close: PropTypes.func.isRequired,
};
