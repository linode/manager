import React, { Component, PropTypes } from 'react';

import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import { LinodeStates, LinodeStatesReadable } from '~/constants';

export function launchWeblishConsole(linode) {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linode.id}/weblish`,
    `weblish_con_${linode.id}`,
    'left=100,top=100,width=1024,height=655,toolbar=0,resizable=1'
  );
}

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
        dispatch(element._action(linode.id, this.state.config || null));
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
