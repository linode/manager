import React, { PropTypes, Component } from 'react';

import { Code } from 'linode-components/formats';


export default class SpecExample extends Component {
  constructor() {
    super();

    this.onClick = this.onClick.bind(this);

    this.state = { collapsed: true };
  }

  onClick() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const { example, type } = this.props;
    const { collapsed } = this.state;

    if (!example) {
      return null;
    }

    const exampleJson = JSON.stringify(example, null, 2);
    const allowCollapsed = exampleJson.split('\n').length > 7;
    const iconType = collapsed ? 'fa-caret-down' : 'fa-caret-up';
    const showHideText = collapsed ? 'Show more' : 'Show less';
    const exampleState = collapsed && allowCollapsed ? '' : 'Example-example--full';

    return (
      <div className="Example">
        <small className="Method-header">Example JSON {type} Body</small>
        <div className={`Example-example ${exampleState}`}>
          <Code
            example={exampleJson}
            name="json"
            noclipboard
          />
          {!allowCollapsed ? null : (
            <div className="Example-toggle" onClick={this.onClick}>
              {showHideText}
              <i className={`fa ${iconType}`} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

SpecExample.propTypes = {
  example: PropTypes.string,
};

SpecExample.defaultProps = {
  type: 'Response',
};
