import React, { Component, PropTypes } from 'react';

import { rebootLinode } from '~/api/linodes';
import { hideModal } from '~/actions/modal';
import { Button } from 'linode-components/buttons';
import { CancelButton } from 'linode-components/buttons';
import { EmitEvent } from 'linode-components/utils';


export default class ConfigSelectModalBody extends Component {
  constructor(props) {
    super();
    const { linode } = props;
    const configIds = Object.keys(linode._configs.configs);
    this.state = {
      loading: false,
      configId: configIds.length ? configIds[0] : null,
    };
  }

  render() {
    const { dispatch, linode, action, title } = this.props;
    const { loading, configId } = this.state;

    const buttonText = action === rebootLinode ? 'Reboot' : 'Power on';

    return (
      <div>
        <p>
          This Linode has multiple configuration profiles associated with it.
          Choose the one you want to boot with.
        </p>
        <div className="ConfigSelectModalBody-configs">
          {Object.values(linode._configs.configs).map(config =>
            <div key={config.id} className="radio">
              <label>
                <input
                  type="radio"
                  name="configs"
                  value={config.id}
                  checked={config.id.toString() === configId}
                  onChange={e => this.setState({ configId: e.target.value })}
                />
                <span>{config.label}</span>
              </label>
            </div>
          )}
        </div>
        <div className="Modal-footer">
          <CancelButton
            disabled={loading}
            onClick={() => {
              EmitEvent('modal:cancel', 'Modal', 'cancel', title);
              dispatch(hideModal());
            }}
          />
          <Button
            className="LinodesLinodeComponentsConfigSelectModalBody-submit"
            disabled={loading}
            onClick={async () => {
              this.setState({ loading: true });
              EmitEvent('modal:submit', 'Modal', buttonText, title);
              await dispatch(action(linode.id, configId));
              this.setState({ loading: false });
              dispatch(hideModal());
            }}
          >{buttonText}</Button>
        </div>
      </div>);
  }
}

ConfigSelectModalBody.propTypes = {
  linode: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  action: PropTypes.func.isRequired,
};
