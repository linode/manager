import React, { PropTypes } from 'react';
import Navigation from './Navigation';
import Infobar from './Infobar';

export default function Header(props) {
  const { username, emailHash } = props;

  return (
    <div className="header">
      <header className="header-info clearfix">
        <Infobar title={props.title} link={props.link} />
      </header>
      <header className="header-main clearfix">
        <Navigation username={username} emailHash={emailHash} />
      </header>
    </div>
  );
}

Header.propTypes = {
  username: PropTypes.string,
  emailHash: PropTypes.string,
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};
