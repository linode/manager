import React, { PropTypes, Component } from 'react';

import { ModalFormGroup } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { attachVolume } from '~/api/volumes';
import { dispatchOrStoreErrors } from '~/api/util';
import { LinodeSelect } from '~/linodes/components';


export default class AttachVolume extends Component {
  static title = 'Attach Volume';

  static trigger(dispatch, linodes, volume) {
    return dispatch(showModal(this.title, (
      <AttachVolume
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
        linodes={linodes}
        volume={volume}
      />
    )));
  }

  constructor(props) {
    super(props);

    this.state = { errors: {} };

    this.onChange = onChange.bind(this);
  }

  onSubmit = () => {
    const { dispatch, close, volume } = this.props;
    const { linode } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => attachVolume(volume.id, linode),
      close,
    ]));
  }

  render() {
    const { close, linodes } = this.props;
    const { errors, linode } = this.state;

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Attach Volume"
        buttonDisabledText="Attaching Volume"
        analytics={{ title: this.title, action: 'attach' }}
        errors={errors}
      >
        <ModalFormGroup label="Linode" id="linode" apiKey="linode" errors={errors}>
          <LinodeSelect
            linodes={linodes}
            value={linode}
            name="linode"
            onChange={this.onChange}
          />
        </ModalFormGroup>
      </FormModalBody>
    );
  }
}

AttachVolume.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  volume: PropTypes.object,
  close: PropTypes.func.isRequired,
};
