import React, { Component } from 'react';
import { PropTypes } from 'prop-types';


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
    const [{ elements: [first] }, ...groups] = this.props.groups;
    const { disabled, dropdownIcon } = this.props;

    const dropdownMenu = groups.map((group, i) => (
      <div className="Dropdown-group" key={group.name || i}>
        {!group.name ? null : (
          <div className="Dropdown-groupLabel">{group.name}</div>
        )}
        <div className="Dropdown-elements">
          {group.elements.map((item) => (
            <button
              type="button"
              key={item.name}
              id={item.name.split(' ').join('-').toLowerCase()}
              className="Dropdown-item"
              // This onMouseDown is intentional. See https://github.com/linode/manager/pull/223
              onMouseDown={item.action}
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
      >
        <button
          type="button"
          className="Dropdown-first"
          onClick={first.action || this.open}
          disabled={disabled}
          id={first.name.split(' ').join('-').toLowerCase()}
        >{first.name}</button>
        {groups.length === 0 ? null : (
          <button
            disabled={disabled}
            type="button"
            className="Dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={this.state.open}
            onClick={this.open}
          ><i className={`fa ${dropdownIcon}`} /></button>
        )}
        <div className={`Dropdown-menu ${orientation}`}>{dropdownMenu}</div>
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
    })),
  })).isRequired,
  leftOriented: PropTypes.bool,
  disabled: PropTypes.bool,
  dropdownIcon: PropTypes.string,
};

Dropdown.defaultProps = {
  dropdownIcon: 'fa-caret-down',
};
