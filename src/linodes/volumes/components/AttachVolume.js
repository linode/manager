import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ModalFormGroup, Select } from 'linode-components/forms';
import { onChange } from 'linode-components/forms/utilities';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import api from '~/api';
import { attachVolume } from '~/api/ad-hoc/volumes';
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
      config: undefined,
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
        const configs = await this.props.dispatch(api.linodes.configs.all([linodeId]));
        const linodeConfigs = Object.values(configs.configs).map(function (config) {
          return {
            label: config.label,
            value: parseInt(config.id),
          };
        });

        this.setState({
          config: undefined,
          fetchingConfigs: false,
          allConfigs: { ...allConfigs, [linodeId]: linodeConfigs },
        });
      }
    });
  }

  onSubmit = () => {
    const { dispatch, close, volume } = this.props;
    const { linode, config } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => attachVolume(volume.id, linode, config),
      close,
    ]));
  }

  render() {
    const { close, linodes, volume } = this.props;
    const { errors, linode, allConfigs, fetchingConfigs } = this.state;
    let { config } = this.state;

    const configs = linode ?
      Object.values(linodes[linode]._configs.configs).map(function (config) {
        return {
          label: config.label,
          value: parseInt(config.id),
        };
      }
    ) : null;

    const linodeConfigs = [
      ...(allConfigs[linode] || configs || {}),
    ];

    if (config === undefined && linodeConfigs[0]) {
      config = linodeConfigs[0].value;
      this.setState({ config });
    }

    const filteredLinodes = _.pickBy(linodes, linode => linode.region === volume.region);

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close}
        buttonText="Attach Volume"
        buttonDisabledText="Attaching Volume"
        analytics={{ title: this.title, action: 'attach' }}
        errors={errors}
      >
        <ModalFormGroup label="Linode" id="linode" apiKey="linode_id" errors={errors}>
          <LinodeSelect
            linodes={filteredLinodes}
            value={linode}
            name="linode"
            onChange={this.onLinodeChange}
          />
        </ModalFormGroup>
        {linodeConfigs.length <= 1 ? null :
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
        }
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
