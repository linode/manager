import React, { Component, PropTypes } from 'react';

import { Code } from 'linode-components/formats';


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

    const iconType = collapsed ? 'fa-caret-down' : 'fa-caret-up';
    const showHideText = collapsed ? 'Show more' : 'Show less';
    const exampleState = collapsed ? '' : 'MethodResponseExample-example--full';
    return (
      <div className="Method-section MethodResponseExample">
        <h5 className="">Example</h5>
        <div className={`MethodResponseExample-example ${exampleState}`}>
          <Code
            example={JSON.stringify(response.example, null, 2)}
            name="json"
            noclipboard
          />
          <div className="MethodResponseExample-toggle" onClick={this.onClick}>
            {showHideText}
            <i className={`fa ${iconType}`} />
          </div>
        </div>
      </div>
    );
  }
}

MethodResponseExample.propTypes = {
  response: PropTypes.shape({
    example: PropTypes.string,
  }),
};
