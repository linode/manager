import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Error } from 'linode-components/errors';
import { ModalShell } from 'linode-components/modals';

import { hideModal } from '~/actions/modal';
import { hideNotifications } from '~/actions/notifications';
import { hideSession } from '~/actions/session';
import { profile } from '~/api';
import Header from '~/components/Header';
import Notifications from '~/components/notifications/Notifications';
import PreloadIndicator from '~/components/PreloadIndicator.js';
import SessionMenu from '~/components/SessionMenu';
import { VERSION } from '~/constants';
import { setStorage } from '~/storage';


export class Layout extends Component {
  // This is a special preload that is only called once on page load because
  // all pages are rendered through here and preloads don't get called again
  // if they were just called.
  static async preload({ dispatch, getState }) {
    if (!Object.keys(getState().api.profile).length) {
      await dispatch(profile.one());
      // Needed for time display component that is not attached to Redux.
      const { timezone } = getState().api.profile;
      setStorage('profile/timezone', timezone);
    }
  }

  constructor() {
    super();

    this.state = { title: '', link: '' };
  }

  render() {
    const {
      username,
      email,
      errors,
      notifications,
      session,
      events,
      source,
      dispatch,
    } = this.props;
    const { title, link } = this.state;
    const version = VERSION ? `v${VERSION}` : 'master';
    const githubRoot = `https://github.com/linode/manager/blob/${version}/`;

    return (
      <div
        className="layout full-height"
        onClick={(e) => {
          const { notifications, session } = this.props;
          // Gross
          const isListItem = e.target.className.includes('NotificationList-listItem');
          const isSessionMenu = e.target.className.includes('SessionMenu');
          if (notifications.open && !isListItem) {
            dispatch(hideNotifications());
          } else if (session.open && !isSessionMenu) {
            dispatch(hideSession());
          }
        }}
      >
        <PreloadIndicator />
        <Notifications />
        <SessionMenu open={session.open} />
        <ModalShell
          open={this.props.modal.open}
          title={this.props.modal.title}
          close={() => dispatch(hideModal())}
        >
          {this.props.modal.body}
        </ModalShell>
        <Header
          dispatch={dispatch}
          link={link}
          title={title}
          email={email}
          username={username}
          notifications={notifications}
          session={session}
          events={events}
        />
        <div className="Main full-height">
          <div className="Main-inner">
            {errors.status ?
              <Error status={errors.status} /> :
              this.props.children}
          </div>
          <footer className="footer text-sm-center">
            <div>
              <span>Version {VERSION}</span>
            </div>
            {!source || !source.source ? null :
              <a
                target="__blank"
                rel="noopener"
                href={`${githubRoot}${source.source}`}
              >
                Page Source
              </a>
            }
            <Link to="/styleguide">Styleguide</Link>
          </footer>
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  username: PropTypes.string,
  email: PropTypes.string,
  currentPath: PropTypes.string,
  children: PropTypes.node.isRequired,
  errors: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  source: PropTypes.object,
  linodes: PropTypes.object,
  modal: PropTypes.object,
  notifications: PropTypes.object,
  session: PropTypes.object,
  events: PropTypes.object,
};

function select(state) {
  return {
    username: state.api.profile.username,
    email: state.api.profile.email,
    currentPath: state.routing.locationBeforeTransitions.pathname,
    errors: state.errors,
    source: state.source,
    linodes: state.api.linodes,
    modal: state.modal,
    notifications: state.notifications,
    session: state.session,
    events: state.api.events,
  };
}

export default connect(select)(Layout);
