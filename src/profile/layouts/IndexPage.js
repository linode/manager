import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

export class IndexPage extends Component {
  render() {
    return null;
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
};


function select(state) {
  return {};
}

export default connect(select)(IndexPage);
