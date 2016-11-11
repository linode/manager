import React, { PropTypes } from 'react';

import { Link } from '~/components/Link';

export default function Header(props) {
  const { username, emailHash, title, link, showInfobar, hideShowNotifications } = props;
  const gravatarLink = `https://gravatar.com/avatar/${emailHash}`;

  const infobar = (
    <nav>
      <div className="float-xs-right">
        {!title ? null :
          <span>
            <span className="new">New</span>
            <a href={link} target="_blank">{title}</a>
          </span>
        }
        <a href="https://github.com/linode" target="_blank"><span className="fa fa-github"></span></a>
        <a href="https://twitter.com/linode" target="_blank"><span className="fa fa-twitter"></span></a>
      </div>
    </nav>
  );

  const main = (
    <nav id="main-nav" className="navbar navbar-default" role="navigation">
      <div className="navbar-header">
        <div className="navbar-linode nav-item">
          <Link to="/">
            <span className="fa fa-linode" />
            <span className="nav-brand">Linode Manager</span>
          </Link>
        </div>
        <div className="navbar-search nav-item">
          <input placeholder="Search..." />
        </div>
        {!username ? null :
          <div
            className="navbar-session float-xs-right"
            onClick={hideShowNotifications}
          >
            <span className="nav-text nav-user">
              {username}
            </span>
            <div className="nav-gravatar">
              <img
                className="nav-gravatar-img"
                src={gravatarLink}
                alt="User Avatar"
                height={35}
                width={35}
              />
            </div>
          </div>
        }
      </div>
    </nav>
  );

  return (
    <div className="header">
      {!showInfobar ? null :
        <header className="header-info clearfix">
          {infobar}
        </header>
      }
      <header className="header-main clearfix">
        {main}
      </header>
    </div>
  );
}

Header.propTypes = {
  username: PropTypes.string,
  emailHash: PropTypes.string,
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  showInfobar: PropTypes.bool.isRequired,
  hideShowNotifications: PropTypes.func,
};

Header.defaultProps = {
  showInfobar: true,
};
