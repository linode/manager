import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';

export class IndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Users'));
  }

  render() {
    return (<div>To Do</div>);
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
};

function select() {
  return {};
}

export default connect(select)(IndexPage);
