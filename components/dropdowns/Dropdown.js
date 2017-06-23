import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { TrackEvent } from '~/actions/trackEvent.js';


export default class Dropdown extends Component {
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
    const [first, ...rest] = this.props.elements;
    const { disabled, dropdownIcon } = this.props;

    const dropdownMenu = rest.map((item, i) => !item ? <hr key={i} /> :
      <button
        type="button"
        key={item.name}
        id={item.name.split(' ').join('-').toLowerCase()}
        className="Dropdown-item"
        // This onMouseDown is intentional. See https://github.com/linode/manager/pull/223
        onMouseDown={item.action}
      >{item.name}</button>
    );

    const orientation = !this.props.leftOriented ? 'Dropdown-menu--right' : '';

    return (
      <div
        className={`Dropdown btn-group ${this.state.open ? 'Dropdown--open' : ''}`}
        onBlur={this.close}
      >
        <button
          type="button"
          className="Dropdown-first"
          onClick={first.action || this.open}
          disabled={disabled}
          id={first.name.split(' ').join('-').toLowerCase()}
        >{first.name}</button>
        {rest.length === 0 ? null : (
          <button
            disabled={disabled}
            type="button"
            className="Dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={this.state.open}
            onClick={() => {
              const value = rest.map((item, i) => !item ? '-' : item.name).join('|');
              TrackEvent('Dropdown', 'open', `${first}|${value}`);
              this.open();
            }}
          ><i className={`fa ${dropdownIcon}`} /></button>
        )}
        <div className={`Dropdown-menu ${orientation}`}>{dropdownMenu}</div>
      </div>
    );
  }
}

Dropdown.propTypes = {
  elements: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.node.isRequired,
    action: PropTypes.func,
  })).isRequired,
  leftOriented: PropTypes.bool,
  disabled: PropTypes.bool,
  dropdownIcon: PropTypes.string,
};

Dropdown.defaultProps = {
  dropdownIcon: 'fa-caret-down',
};
