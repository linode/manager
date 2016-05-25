import React from 'react';
import Navigation from './Navigation';

export default function Header(props) {
  const { username } = props;
  return (
    <div className="header" style={props.style}>
      <header>
        <Navigation username={username} />
      </header>
    </div>
  );
}
