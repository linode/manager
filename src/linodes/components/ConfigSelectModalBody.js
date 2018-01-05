import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';

import { ModalFormGroup, Radio } from 'linode-components';
import { FormModalBody } from 'linode-components';

import { hideModal } from '~/actions/modal';
import { rebootLinode } from '~/api/ad-hoc/linodes';

export default class ConfigSelectModalBody extends Component {
  constructor(props) {
    super();

    const configIds = Object.keys(props.linode._configs.configs);

    this.state = {
      errors: {},
      configId: configIds.length ? configIds[0] : null,
    };
  }

  onSubmit = () => {
    const { dispatch, linode, action } = this.props;
    const { configId } = parseInt(this.state.configId);

    action(linode.id, configId);
    dispatch(hideModal());
  }

  onCreateConfig = () => {
    const { dispatch, linode } = this.props;

    return dispatch(push(`/linodes/${linode.label}/settings/advanced/configs/create`));
  }

  render() {
    const { dispatch, linode, action, title } = this.props;
    const { errors, configId } = this.state;

    const buttonText = action === rebootLinode ? 'Reboot' : 'Power On';
    const buttonDisabledText = action === rebootLinode ? 'Rebooting' : 'Powering On';

    if (Object.values(linode._configs.configs).length === 0) {
      return (
        <FormModalBody
          onCancel={() => dispatch(hideModal())}
          onSubmit={this.onCreateConfig}
          buttonText="Create A Config"
          buttonDisabledText={buttonDisabledText}
        >
          This Linode has no configuration profiles associated with it.
          You must create one to boot this Linode.
        </FormModalBody>
      );
    }

    return (
      <FormModalBody
        onCancel={() => dispatch(hideModal())}
        onSubmit={this.onSubmit}
        buttonText={buttonText}
        buttonDisabledText={buttonDisabledText}
        analytics={{ title }}
      >
        <div>
          <p>
            This Linode has multiple configuration profiles associated with it.
            Choose the one you want to boot with.
          </p>
          <ModalFormGroup id="configs" label="" apiKey="config_id" errors={errors}>
            {Object.values(linode._configs.configs).map(config => (
              <Radio
                checked={config.id.toString() === configId}
                value={config.id.toString()}
                name="config"
                onChange={e => this.setState({ configId: e.target.value })}
                key={config.label}
                label={config.label}
              />
            ))}
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

ConfigSelectModalBody.propTypes = {
  linode: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  action: PropTypes.func.isRequired,
};
