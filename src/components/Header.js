import React, { PropTypes } from 'react';
import Navigation from './Navigation';
import Info from './Info';

export default function Header(props) {
  const { username } = props;
  return (
    <div className="header" style={props.style}>
      <header className="header-info">
        <Info />
      </header>
      <header className="header-main">
        <Navigation username={username} />
      </header>
    </div>
  );
}

Header.propTypes = {
  username: PropTypes.string,
  style: PropTypes.object,
};
