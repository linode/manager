import React, { Component, PropTypes } from 'react';

import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import { LinodeStates, LinodeStatesReadable } from '~/constants';

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
    const { linode, dispatch } = this.props;
    const dropdownElements = [
      {
        name: <span><i className="fa fa-refresh"></i> Reboot</span>,
        _key: 'reboot',
        _action: rebootLinode,
        _condition: () => linode.status !== 'offline',
      },
      {
        name: <span><i className="fa fa-power-off"></i> Power off</span>,
        _key: 'power-off',
        _action: powerOffLinode,
        _condition: () => linode.status === 'running',
      },
      {
        name: <span><i className="fa fa-power-off"></i> Power on</span>,
        _key: 'power-on',
        _action: powerOnLinode,
        _condition: () => linode.status === 'offline',
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

    const orientation = this.props.leftOriented === false ?
                        'dropdown-menu-right' : '';

    return (
      <div
        className={`btn-group status-dropdown ${this.state.open ? 'open' : ''}`}
        onBlur={this.close}
      >
        <span className={`pull-left linode-status ${linode.status}`}>
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
        <div className={`dropdown-menu ${orientation}`}>{dropdownMenu}</div>
      </div>
    );
  }
}

StatusDropdown.propTypes = {
  linode: PropTypes.object,
  dispatch: PropTypes.func,
  leftOriented: PropTypes.bool,
};
