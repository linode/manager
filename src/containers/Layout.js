import React, { Component } from 'react';
import { Link } from 'react-router';
import Navigation from '../components/Navigation';

class Layout extends Component {
  render() {
    return (
      <div>
        <Navigation />
        {this.props.children}
      </div>
    );
  }
}

export default Layout;
