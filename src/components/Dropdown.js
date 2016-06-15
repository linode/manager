import React, { Component, PropTypes } from 'react';

export default class Dropdown extends Component {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  open(evt) {
    const event = evt || window.event;
    const target = event.currentTarget || event.srcElement;
    target.parentElement.classList.toggle('open');
    return false;
  }

  close(evt) {
    // Adapted from https://github.com/tagawa/bootstrap-without-jquery
    const event = evt || window.event;
    const target = event.currentTarget || event.srcElement;
    target.parentElement.classList.remove('open');

    if (event.relatedTarget && event.relatedTarget.getAttribute('data-toggle') !== 'dropdown') {
      event.relatedTarget.click();
    }
    return false;
  }

  render() {
    const [first, ...rest] = this.props.elements;

    const dropdownMenu = rest.map(({ name, action }) =>
      <button
        type="button"
        key={name}
        className="btn dropdown-item"
        onClick={action}
      >{name}</button>
    );

    const orientation = this.props.leftOriented ? '' : 'dropdown-menu-right';

    return (
      <div className="btn-group">
        <button
          type="button"
          className="btn dropdown-first"
          onClick={first.action}
        >{first.name}</button>
        <button
          type="button"
          className="btn dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          onClick={this.open}
          onBlur={this.close}
        >
          <span className="sr-only">Toggle dropdown</span>
        </button>
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
};
