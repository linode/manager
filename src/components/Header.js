import React, { PropTypes } from 'react';
import Navigation from './Navigation';
import Infobar from './Infobar';

export default function Header(props) {
  const { username } = props;
  return (
    <div className="header" style={props.style}>
      <header className="header-info">
        <Infobar />
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
