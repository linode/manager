import React, { Component } from 'react';
import Navigation from './Navigation';

export default class Header extends Component {
  render() {
    const { username } = this.props;
    return (
      <div className="header" style={this.props.style}>
          <header>
              <Navigation username={username} />
          </header>
      </div>
    );
  }
}
