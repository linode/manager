import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import { hideNotifications, showNotifications } from '~/actions/notifications';
import { hideSession, showSession } from '~/actions/session';
import { eventSeen } from '~/api/events';
import { LinodeLogoImgSrc } from '~/assets';
import { getEmailHash } from '~/cache';


export default class Header extends Component {
  toggleNotifications = () => {
    const { dispatch, notifications } = this.props;

    if (notifications.open) {
      dispatch(hideNotifications());
    } else {
      this.markEventsSeen();
      dispatch(hideSession());
      dispatch(showNotifications());
    }
  }

  async markEventsSeen() {
    const { dispatch, events } = this.props;
    const unseenIds = events.ids.filter(function (id) {
      return !events.events[id].seen;
    });

    // mark up to and including the most recent event seen
    if (unseenIds.length) {
      await dispatch(eventSeen(unseenIds[0]));
    }
  }

  toggleSession = () => {
    const { dispatch, session } = this.props;

    if (session.open) {
      dispatch(hideSession());
    } else {
      dispatch(hideNotifications());
      dispatch(showSession());
    }
  }

  render() {
    const { username, notifications, events, email } = this.props;
    const gravatarLink = `https://gravatar.com/avatar/${getEmailHash(email)}`;
    const { pathname } = window.location;
    const linkClass = (link, primary = 'MainHeader') =>
      `${primary}-link ${pathname.indexOf(link) === 0 ? `${primary}-link--selected` : ''}`;

    const unseenCount = notifications.open ? 0 :
      events.ids.reduce(function (count, id) {
        return events.events[id].seen ? count : count + 1;
      }, 0);

    return (
      <div className="Header">
        <div className="MainHeader clearfix">
          <div className="container">
            <div className="MainHeader-brand">
              <Link to="/">
                <span className="MainHeader-logo">
                  <img
                    src={LinodeLogoImgSrc}
                    alt="Linode Logo"
                    height={40}
                    width={35}
                  />
                </span>
              </Link>
            </div>
            <Link
              className={`${linkClass('/linodes')}`}
              to="/linodes"
            >Linodes</Link>
            <Link
              className={`${linkClass('/nodebalancers')}`}
              to="/nodebalancers"
            >NodeBalancers</Link>
            <Link
              className={`${linkClass('/domains')}`}
              to="/domains"
            >Domains</Link>
            {!username ? null : (
              <div
                className="MainHeader-session float-sm-right"
                onClick={this.toggleSession}
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
              </div>
            )}
            {!username ? null : (
              <div
                className="MainHeader-notifications float-sm-right"
                onClick={this.toggleNotifications}
              >
                <i className="fa fa-bell-o" />
                {!unseenCount ? null : (
                  <span className="MainHeader-badge Badge">{unseenCount}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  username: PropTypes.string,
  email: PropTypes.string,
  dispatch: PropTypes.func,
  notifications: PropTypes.object,
  session: PropTypes.object,
  events: PropTypes.object,
};

// These defaultProps are only used by the router when it is rendering the half-empty loading page.
Header.defaultProps = {
  email: '',
  notifications: { open: false },
  session: { open: false },
  events: { ids: [] },
};
