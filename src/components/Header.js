import React, { PropTypes } from 'react';

import { Link } from '~/components/Link';

export default function Header(props) {
  const { username, emailHash, title, link, showInfobar, hideShowNotifications, events } = props;
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

  const unseenNotifications = Object.values(events.events).reduce((unseen, e) =>
    e.seen ? unseen : unseen + 1, 0);
  const main = (
    <div className="MainHeader clearfix">
      <div className="MainHeader-brand">
        <Link to="/">
          <span className="MainHeader-logo fa fa-linode" />
          <span className="MainHeader-title">Linode Manager</span>
        </Link>
      </div>
      <div className="MainHeader-search">
        <input placeholder="Search..." />
      </div>
      {!username ? null :
        <div
          className="MainHeader-session float-xs-right"
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
    </div>
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
};

Header.defaultProps = {
  showInfobar: true,
};
