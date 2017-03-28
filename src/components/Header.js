import React, { PropTypes, Component } from 'react';

import { LinodeLogoImgSrc } from '~/assets';

import { Link } from '~/components/Link';
import { eventSeen } from '~/api/events';
import { hideSession, showSession } from '~/actions/session';
import { hideNotifications, showNotifications } from '~/actions/notifications';

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
    const {
      emailHash,
      username,
      notifications,
      events,
    } = this.props;

    const gravatarLink = `https://gravatar.com/avatar/${emailHash}`;
    const { pathname } = window.location;
    const linkClass = (link, primary = 'MainHeader') =>
      `${primary}-link ${link === pathname ? `${primary}-link--selected` : ''}`;

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
                <span className="MainHeader-title">Linode Manager</span>
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
              className={`${linkClass('/dnsmanager')}`}
              to="/dnsmanager"
            >DNS Manager</Link>
            {!username ? null :
              <div
                className="MainHeader-session float-xs-right"
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
            }
            <div
              className="MainHeader-notifications float-xs-right"
              onClick={this.toggleNotifications}
            >
              <i className="fa fa-bell-o"></i>
              {!unseenCount ? null : <span className="MainHeader-badge badge">{unseenCount}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  username: PropTypes.string,
  emailHash: PropTypes.string,
  dispatch: PropTypes.func,
  notifications: PropTypes.object,
  session: PropTypes.object,
  events: PropTypes.object,
};
