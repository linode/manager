import React, { Component, PropTypes } from 'react';

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
    const { response } = this.props;
    const { collapsed } = this.state;

    const caretClass = collapsed ? 'fa-caret-right' : 'fa-caret-down';
    const collapsedDenotation = collapsed ? '(show)' : '(hide)';
    return (
      <div className="Method-section MethodResponseExample">
        <div className="MethodResponseExample-header" onClick={this.onClick}>
          <h3>Example</h3>
          <span className="MethodResponseExample-headerControl">
            {collapsedDenotation}
            <i className={`MethodResponseExample-headerIcon fa ${caretClass}`} />
          </span>
        </div>
        <Example
          example={JSON.stringify(response.example, null, 2)}
          name="json"
          noclipboard
          collapsed={collapsed}
        />
      </div>
    );
  }
}

MethodResponseExample.propTypes = {
  response: PropTypes.shape({
    example: PropTypes.string,
  }),
};
