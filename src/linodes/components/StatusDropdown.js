import React, { Component, PropTypes } from 'react';

import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import { showModal, hideModal } from '~/actions/modal';

export function launchWeblishConsole(linode) {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linode.id}/weblish`,
    `weblish_con_${linode.id}`,
    'left=100,top=100,width=1024,height=655,toolbar=0,resizable=1'
  );
}

export class ConfigSelectModal extends Component {
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
    const { dispatch, linode, action } = this.props;
    const { loading, configId } = this.state;

    const buttonText = action === rebootLinode ? 'Reboot' : 'Power on';

    return (
      <div>
        <p>
          This Linode has multiple configuration profiles associated with it.
          Choose the one you want to boot with.
        </p>
        <div className="LinodesComponentsStatusDropdown-configs">
          {Object.values(linode._configs.configs).map(config =>
            <label key={config.id} className="radio">
              <input
                type="radio"
                name="configs"
                value={config.id}
                checked={config.id.toString() === configId}
                onChange={e => this.setState({ configId: e.target.value })}
              />
              <span>{config.label}</span>
            </label>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-cancel"
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          >Cancel</button>
          <button
            className="btn btn-default"
            disabled={loading}
            onClick={async () => {
              this.setState({ loading: true });
              await dispatch(action(linode.id, configId));
              this.setState({ loading: false });
              dispatch(hideModal());
            }}
          >{buttonText}</button>
        </div>
      </div>);
  }
}

ConfigSelectModal.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  action: PropTypes.func.isRequired,
};

export default class StatusDropdown extends Component {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.state = {
      open: false,
    };
  }

  open() {
    this.setState({ open: !this.state.open });
  }

  close() {
    this.setState({ open: false });
  }


  render() {
    const { linode, dispatch, shortcuts } = this.props;
    const dropdownElements = [
      {
        name: <span>Reboot</span>,
        _key: 'reboot',
        _action: rebootLinode,
        _condition: () => linode.status !== 'offline',
        _configs: true,
      },
      {
        name: <span>Power off</span>,
        _key: 'power-off',
        _action: powerOffLinode,
        _condition: () => linode.status === 'running',
      },
      {
        name: <span>Power on</span>,
        _key: 'power-on',
        _action: powerOnLinode,
        _condition: () => linode.status === 'offline',
        _configs: true,
      },
      {
        name: <span>Launch Console</span>,
        _key: 'text-console',
        _action: () => launchWeblishConsole(linode),
        _condition: () => shortcuts,
      },
    ]
    .filter(element => element._condition())
    .map(element => ({
      ...element,
      action: () => {
        this.close();

        const commit = () => {
          dispatch(element._action(linode.id, this.state.config || null));
        };

        const configCount = Object.keys(linode._configs.configs).length;
        if (!element._configs || configCount <= 1) {
          commit();
          return;
        }

        dispatch(showModal('Select configuration profile',
          <ConfigSelectModal
            linode={linode}
            dispatch={dispatch}
            action={element._action}
          />
        ));
      },
    }));

    const dropdownMenu = dropdownElements.map(({ name, action, _key }) =>
      <button
        type="button"
        key={_key}
        className="StatusDropdown-item"
        onMouseDown={action}
      >{name}</button>
    );
    const openClass = this.state.open ? 'StatusDropdown--open' : '';

    if (LinodeStates.pending.indexOf(linode.status) !== -1) {
      return (
        <div className="StatusDropdown">
          <div className="StatusDropdown-container">
            <div
              style={{ width: `${linode.__progress}%` }}
              className="StatusDropdown-progress"
            >
              <span className="StatusDropdown-percent">{Math.round(linode.__progress)}%</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`StatusDropdown ${openClass}`}
        onBlur={this.close}
      >
        <button
          type="button"
          className="StatusDropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded={this.state.open}
          onClick={this.open}
          disabled={LinodeStates.pending.indexOf(linode.status) !== -1}
        >
          <span className="StatusDropdown-status">
            {LinodeStatesReadable[linode.status] || 'Offline'}
          </span>
          <i className="fa fa-caret-down" />
        </button>
        <div className="StatusDropdown-menu">{dropdownMenu}</div>
      </div>
    );
  }
}

StatusDropdown.propTypes = {
  linode: PropTypes.object,
  dispatch: PropTypes.func,
  shortcuts: PropTypes.bool,
  short: PropTypes.bool,
};

StatusDropdown.defaultProps = {
  shortcuts: true,
  short: true,
};
