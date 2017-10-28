import PropTypes from 'prop-types';
import React, { Component } from 'react';

// Avoid a circular import by importing ../buttons by itself.
import Button from '../buttons/Button';
import { EmitEvent, DROPDOWN_OPEN, DROPDOWN_CLICK, DROPDOWN_CLOSE } from '../utils';


export default class Dropdown extends Component {
  constructor() {
    super();

    this.state = {
      open: false,
    };
  }

  close = () => {
    if (typeof this.props.onClose === 'function') {
      this.props.onClose();
    }

    this.emitEvent(DROPDOWN_CLOSE, 'close');

    this.setState({ open: false });
  }

  emitEvent(type, action, item) {
    if (this.props.analytics && this.props.analytics.title) {
      EmitEvent(type, 'dropdown', action, this.props.analytics.title, item);
    }
  }

  open = () => {
    if (typeof this.props.onOpen === 'function') {
      this.props.onOpen();
    }

    this.emitEvent(DROPDOWN_OPEN, 'open');

    this.setState({ open: !this.state.open });
  }

  wrapClick(f, item) {
    return (...args) => {
      this.emitEvent(DROPDOWN_CLICK, 'change', item);
      f(...args);
    };
  }

  render() {
    const [{ elements: [first] }, ...groups] = this.props.groups;
    const { disabled, dropdownIcon } = this.props;

    let allGroups = this.props.groups;
    if (!this.props.duplicateFirst) {
      allGroups = groups;
    }

    const dropdownMenu = allGroups.map((group, i) => (
      <div className="Dropdown-group" key={group.name || i}>
        {!group.name ? null : (
          <div className="Dropdown-groupLabel">{group.name}</div>
        )}
        <div className="Dropdown-elements">
          {group.elements.map((item) => (
            <button
              type="button"
              key={item.name}
              id={(item || '').name.split(' ').join('-').toLowerCase()}
              className="Dropdown-item"
              // This onMouseDown is intentional. See https://github.com/linode/manager/pull/223
              onMouseDown={this.wrapClick(item.action, item.name)}
            >{item.name}</button>
          ))}
        </div>
      </div>
    ));

    const orientation = !this.props.leftOriented ? 'Dropdown-menu--right' : '';

    return (
      <div
        className={`Dropdown btn-group ${this.state.open ? 'Dropdown--open' : ''}`}
        onBlur={this.close}
        tabIndex="-1" // This allows firefox to treat this as a blurrable element.
      >
        <Button
          type="button"
          className="Dropdown-first"
          onClick={first.action ? this.wrapClick(first.action, first.name) : this.open}
          to={first.to}
          disabled={disabled}
          id={first.name.split(' ').join('-').toLowerCase()}
        >
          {first.icon ? <i className={`fa ${first.icon}`} /> : null}
          {first.name}
        </Button>
        {groups.length === 0 ? null : (
          <Button
            disabled={disabled}
            type="button"
            className="Dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={this.state.open}
            onClick={this.open}
          ><i className={`fa ${dropdownIcon}`} /></Button>
        )}
        {groups.length === 0 ? null : (
          <div className={`Dropdown-menu ${orientation}`}>{dropdownMenu}</div>
        )}
      </div>
    );
  }
}

Dropdown.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.node,
    elements: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.node.isRequired,
      action: PropTypes.func,
      to: PropTypes.string,
      icon: PropTypes.string,
    })),
  })).isRequired,
  leftOriented: PropTypes.bool,
  disabled: PropTypes.bool,
  dropdownIcon: PropTypes.string,
  duplicateFirst: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  analytics: PropTypes.shape({
    title: PropTypes.string,
  }),
};

Dropdown.defaultProps = {
  dropdownIcon: 'fa-caret-down',
  analytics: {},
  duplicateFirst: true,
};
