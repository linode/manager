import * as React from 'react';
import scriptLoader from 'react-async-script-loader';

import './LinodePac.css';

class LinodePac extends React.Component {
  componentDidMount() {}

  render() {
    return <div id="linodepac" />;
  }
}

export default scriptLoader([
  '/js/Animation.js',
  '/js/Ghost.js',
  '/js/KeyButton.js',
  '/js/keycodes.js',
  '/js/Level.js',
  '/js/Pip.js',
  '/js/Player.js',
  '/js/init.js'
])(LinodePac);
