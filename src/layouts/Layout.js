import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Header from '../components/Header';

class Layout extends Component {
  render() {
    const { username } = this.props;
    return (
      <div className="layout">
        <Header username={username} />
        <div className="container">
          {this.props.children}
        </div>
      </div>
    );
  }
}

function select(state) {
  return { username: state.authentication.username };
}

export default connect(select)(Layout);
