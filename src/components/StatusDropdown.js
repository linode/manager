import React, { Component, PropTypes } from 'react';

import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import { launchWeblishConsole } from '~/linodes/components/Linode';

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
        className="btn dropdown-item"
        onMouseDown={action}
      >{name}</button>
    );

    const openClass = this.state.open ? 'open' : '';
    const borderClass = this.props.noBorder ? '' : 'status-dropdown-border';
    return (
      <div
        className={`btn-group status-dropdown ${openClass} ${borderClass}`}
        onBlur={this.close}
      >
        <span className={`float-xs-left linode-status ${linode.status}`}>
          {LinodeStatesReadable[linode.status]}
        </span>
        <button
          type="button"
          className="btn dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded={this.state.open}
          onClick={this.open}
          disabled={LinodeStates.pending.indexOf(linode.status) !== -1}
        >
          <span className="sr-only">Toggle dropdown</span>
        </button>
        <div className="dropdown-menu">{dropdownMenu}</div>
      </div>
    );
  }
}

StatusDropdown.propTypes = {
  linode: PropTypes.object,
  dispatch: PropTypes.func,
  noBorder: PropTypes.bool,
  shortcuts: PropTypes.bool,
};

StatusDropdown.defaultProps = {
  noBorder: true,
  shortcuts: true,
};
