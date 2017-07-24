import React, { Component, PropTypes } from 'react';

import { ModalFormGroup, Radio } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { hideModal } from '~/actions/modal';
import { rebootLinode } from '~/api/linodes';
import { dispatchOrStoreErrors } from '~/api/util';


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
    const { configId } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => action(linode.id, configId),
      hideModal,
    ]));
  }

  render() {
    const { dispatch, linode, action, title } = this.props;
    const { errors, configId } = this.state;

    const buttonText = action === rebootLinode ? 'Reboot' : 'Power On';
    const buttonDisabledText = action === rebootLinode ? 'Rebooting' : 'Powering On';

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
                value={config.id}
                onChange={e => this.setState({ configId: e.target.value })}
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
