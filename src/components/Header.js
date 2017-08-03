import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

import { Header as HeaderWrapper } from 'linode-components/navigation';

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

  renderLink(props) {
    const {
      to,
      label,
      parentClass = 'MainHeader',
      alsoHighlightOn = [],
    } = props;
    const { pathname } = window.location;

    const shouldHighlight = [...alsoHighlightOn, to].reduce(
      (should, link) => should || pathname.indexOf(link) === 0, false);

    const linkClass = shouldHighlight ? `${parentClass}-link--selected` : '';

    return (
      <Link
        className={`${parentClass}-link ${linkClass}`}
        to={to}
      >{label}</Link>
    );
  }

  render() {
    const { username, notifications, events, email } = this.props;
    const gravatarLink = `https://gravatar.com/avatar/${getEmailHash(email)}`;
    const { pathname } = window.location;

    const unseenCount = notifications.open ? 0 :
      events.ids.reduce(function (count, id) {
        return events.events[id].seen ? count : count + 1;
      }, 0);

    const infoHeader = (
      <div className="MiniHeader-text">
        This is the early-access Linode Manager.
        Click <a href="https://manager.linode.com">here</a> to go back to the classic Linode Manager.
      </div>
    );

    let contextHeader;
    if (['linodes', 'stackscripts', 'images', 'volumes'].indexOf(pathname.split('/')[1]) !== -1) {
      contextHeader = (
        <div className="Menu">
          <div className="Menu-item">
            <this.renderLink to="/stackscripts" label="StackScripts" parentClass="ContextHeader" />
          </div>
          <div className="Menu-item">
            <this.renderLink to="/images" label="Images" parentClass="ContextHeader" />
          </div>
          <div className="Menu-item">
            <this.renderLink to="/volumes" label="Volumes" parentClass="ContextHeader" />
          </div>
        </div>
      );
    }

    return (
      <HeaderWrapper infoHeader={infoHeader} contextHeader={contextHeader}>
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
        <this.renderLink
          to="/linodes"
          label="Linodes"
          alsoHighlightOn={['/stackscripts', '/volumes', '/images']}
        />
        <this.renderLink to="/nodebalancers" label="NodeBalancers" />
        <this.renderLink to="/domains" label="Domains" />
        <this.renderLink to="/support" label="Support" />
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
      </HeaderWrapper>
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
