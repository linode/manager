import React, { Component } from 'react';

import { default as Example } from './Example';


export default class MethodResponseExample extends Component {

  constructor() {
    super();

    this.onClick = this.onClick.bind(this);

    this.state = { collapsed: true };
  }

  onClick() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const { resource } = this.props;
    const { collapsed } = this.state;

    const caretClass = collapsed ? 'fa-caret-right' : 'fa-caret-down';

    return (
      <div className="Method-section MethodResponseExample">
        <div className="MethodResponseExample-header" onClick={this.onClick}>
          <h4>
            <b>Example</b>
            <i className={`MethodResponseExample-headerIcon fa ${caretClass}`} />
          </h4>

        </div>
        <Example example={JSON.stringify(resource.example, null, 2)} name="json" noclipboard collapsed={collapsed} />
      </div>
    );
  }
}
