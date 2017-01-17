import React, { Component } from 'react';
import { connect } from 'react-redux';


// eslint-disable-next-line react/prefer-stateless-function
export class ResizePage extends Component {
  render() {
    return (
      <div className="container"></div>
    );
  }
}

function select() {
  return {};
}

export default connect(select)(ResizePage);
