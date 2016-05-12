import React, { Component } from 'react';

export default class Dropdown extends Component {
  render() {
    const { elements } = this.props;
    const [first, ...rest] = elements;

    const dropdownBody = rest.map(element =>
      <div key={element.name}
          className="li-dropdown-item"
          onClick={element.action}>
          {element.name}
      </div>
    );

    return (
      <span className="li-dropdown">
        <span onClick={first.action}
         className="li-dropdown-item li-dropdown-first">{first.name}</span>
        <span className="li-dropdown-body">
          <span className="li-dropdown-activator"><span className="fa fa-sort-down" /></span>
          <div className="li-dropdown-target">{dropdownBody}</div>
        </span>
      </span>
    );
  }
}
