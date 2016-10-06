import React, { Component, PropTypes } from 'react';

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
    const dropdownMenu = this.props.elements.map(({ name, action, _key }) =>
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
        className={`btn-group ${this.state.open ? 'open' : ''}`}
        onBlur={this.close}
      >
        <div className="status-dropdown pull-left">
          {this.props.children}
        </div>
        <button
          type="button"
          className="btn dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded={this.state.open}
          onClick={this.open}
        >
          <span className="sr-only">Toggle dropdown</span>
        </button>
        <div className={`dropdown-menu ${orientation}`}>{dropdownMenu}</div>
      </div>
    );
  }
}

StatusDropdown.propTypes = {
  elements: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.node.isRequired,
    action: PropTypes.func,
  })).isRequired,
  leftOriented: PropTypes.bool,
};
