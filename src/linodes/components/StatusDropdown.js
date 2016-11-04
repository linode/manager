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
      progress: 1,
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
        className="btn dropdown-item"
        onMouseDown={action}
      >{name}</button>
    );

    const openClass = this.state.open ? 'open' : '';
    const progressContainer = this.props.short ? 'progress-cont' : 'progress-cont-long';
    if (LinodeStates.pending.indexOf(linode.status) !== -1) {
      return (
        <div
          className={`btn-group status-dropdown ${openClass}`}
          onBlur={this.close}
        >
          <div className={`${progressContainer}`}>
            <div
              style={{ width: `${linode.progress}%` }}
              className="progress"
            />
          </div>
        </div>
      );
    }
    return (
      <div
        className={`clearfix btn-group status-dropdown ${openClass}`}
        onBlur={this.close}
      >
        <button
          type="button"
          className="btn dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded={this.state.open}
          onClick={this.open}
          disabled={LinodeStates.pending.indexOf(linode.status) !== -1}
        >
          <span>
            {LinodeStatesReadable[linode.status]}
          </span>
          <i className="fa fa-caret-down" />
        </button>
        <div className="dropdown-menu">{dropdownMenu}</div>
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
