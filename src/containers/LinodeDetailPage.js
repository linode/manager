import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class LinodeDetailPage extends Component {
  componentDidMount() {
    console.log(this.props);
  }

  render() {
    return (
      <h1>linode detail page</h1>
    );
  }
}

function select(state) {
  return { linodes: state.linodes };
}

export default connect(select)(LinodeDetailPage);
