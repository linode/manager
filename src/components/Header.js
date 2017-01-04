import React, { PropTypes } from 'react';
import { LinodeLogoImgSrc } from '~/assets';
import { Link } from '~/components/Link';

export default function Header(props) {
  const {
    username,
    emailHash,
    title,
    link,
    showInfobar,
    hideShowNotifications,
    events,
    notificationsOpen,
  } = props;
  const gravatarLink = `https://gravatar.com/avatar/${emailHash}`;

  const infobar = (
    <div className="MiniHeader clearfix">
      <div className="MiniHeader-content float-xs-right">
        {!title ? null :
          <span>
            <span className="MiniHeader-new">New</span>
            <a href={link} target="_blank" className="MiniHeader-blog">{title}</a>
          </span>}
        <a href="https://github.com/linode" target="_blank" className="MiniHeader-github">
          <i className="fa fa-github" />
        </a>
        <a href="https://twitter.com/linode" target="_blank" className="MiniHeader-twitter">
          <i className="fa fa-twitter" />
        </a>
      </div>
    </div>
  );

  const unseenNotifications = notificationsOpen ? 0 :
    Object.values(events.events).reduce((unseen, e) =>
      e.seen ? unseen : unseen + 1, 0);

  const main = (
    <nav className="MainHeader navbar">
      <div className="MainHeader-brand navbar-brand">
        <Link to="/">
          <span className="MainHeader-logo">
            <img
              src={LinodeLogoImgSrc}
              alt="Linode Logo"
              height={40}
              width={35}
            />
          </span>
          <span className="MainHeader-title">Linode Manager</span>
        </Link>
      </div>
      <div className="MainHeader-search">
        <input placeholder="Search..." disabled />
      </div>
      {!username ? null :
        <div
          className="MainHeader-session navbar-right"
          onClick={hideShowNotifications}
        >
          <span className="MainHeader-username">
            {username}
          </span>
          <img
            className="MainHeader-gravatar"
            src={gravatarLink}
            alt="User Avatar"
            height={35}
            width={35}
          />
          {!unseenNotifications ? null :
            <span className="MainHeader-badge">{unseenNotifications}</span>}
        </div>
      }
    </nav>
  );

  return (
    <div className="Header">
      {!showInfobar ? null : infobar}
      {main}
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
  events: PropTypes.object,
  notificationsOpen: PropTypes.bool.isRequired,
};

Header.defaultProps = {
  showInfobar: true,
};
