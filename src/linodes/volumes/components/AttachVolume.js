import React, { PropTypes, Component } from 'react';

import { ModalFormGroup, Select } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { attachVolume } from '~/api/volumes';
import { linodes } from '~/api';
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

    this.state = {
      config: 0,
      allConfigs: {},
      errors: {},
    };

    this.onChange = onChange.bind(this);
  }

  onLinodeChange = (e) => {
    this.onChange(e);
    this.setState({ fetchingConfigs: true }, async () => {
      const linodeId = e.target.value;
      const { allConfigs } = this.state;

      if (!allConfigs[linodeId]) {
        const configs = await this.props.dispatch(linodes.configs.all([linodeId]));
        const linodeConfigs = Object.values(configs.configs).map(function (config) {
          return {
            label: config.label,
            value: config.id,
          };
        });

        this.setState({
          fetchingConfigs: false,
          allConfigs: { ...allConfigs, [linodeId]: linodeConfigs },
        });
      }
    });
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
    const { errors, linode, allConfigs, config, fetchingConfigs } = this.state;

    const configs = linode ?
      Object.values(linodes[linode]._configs.configs).map(function (config) {
        return {
          label: config.label,
          value: config.id,
        };
      }
    ) : null;

    const linodeConfigs = [
      { label: '-- None --', value: 0 },
      ...allConfigs[linode] || configs || {},
    ];

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
            onChange={this.onLinodeChange}
          />
        </ModalFormGroup>
        <ModalFormGroup label="Config" id="config" apiKey="config" errors={errors}>
          <Select
            options={linodeConfigs}
            value={config}
            name="config"
            id="config"
            onChange={this.onChange}
            disabled={fetchingConfigs}
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
