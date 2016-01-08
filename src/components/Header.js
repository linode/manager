import React, { Component } from 'react';
import clouds from 'file!../../styles/assets/BH_02 Clouds v2.svg';
import sky from 'file!../../styles/assets/BH_01 Sky.svg';

/*
  background:
      url($root + '/assets/BH_02 Clouds v2.svg'),
      url($root + '/assets/BH_01 Sky.svg');
*/

export default class Header extends Component {
  render() {
    return (
      <div className="header" style={this.props.style}>
          <div className="bg-clouds" style={{
            backgroundImage: `url(${clouds}), url(${sky})`
          }}>
          </div>
      </div>
    );
  }
}
