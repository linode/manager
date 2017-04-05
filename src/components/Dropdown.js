import React, { Component, PropTypes } from 'react';


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
    const { disabled } = this.props;

    const dropdownMenu = rest.map(({ name, action }) =>
      <button
        type="button"
        key={name}
        className="btn dropdown-item"
        // This onMouseDown is intentional. See https://github.com/linode/manager/pull/223
        onMouseDown={action}
      >{name}</button>
    );

    const orientation = this.props.leftOriented === false ? 'dropdown-menu-right' : '';

    return (
      <div
        className={`btn-group ${this.state.open ? 'open' : ''}`}
        onBlur={this.close}
      >
        <button
          type="button"
          className="btn dropdown-first"
          onClick={first.action}
          disabled={disabled}
        >{first.name}</button>
        {rest.length !== 0 ?
          <button
            disabled={disabled}
            type="button"
            className="btn dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={this.state.open}
            onClick={this.open}
          >
            <i className="fa fa-caret-down"></i>
          </button> : null}
        <div className={`dropdown-menu ${orientation}`}>{dropdownMenu}</div>
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
};
