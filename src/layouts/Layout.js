import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { ModalShell } from 'linode-components/modals';
import { Error } from 'linode-components/errors';

import { hideModal } from '~/actions/modal';
import { hideNotifications } from '~/actions/notifications';
import { hideSession } from '~/actions/session';
import * as api from '~/api';
import Header from '~/components/Header';
import Notifications from '~/components/notifications/Notifications';
import PreloadIndicator from '~/components/PreloadIndicator.js';
import SessionMenu from '~/components/SessionMenu';
import { VERSION } from '~/constants';
import { setStorage } from '~/storage';


export class Layout extends Component {
  static async preload({ dispatch, getState }) {
    // Fetch not just timezone but also email and username.
    if (!getState().api.profile.timezone) {
      const { timezone } = await dispatch(api.profile.one());
      // Needed for time display component that is not attached to Redux.
      setStorage('profile/timezone', timezone);
    }

    // Filter out objects we've already grabbed this page session.
    const rest = ['kernels', 'types', 'regions', 'distributions'].filter(
      type => Object.values(getState().api[type]).length);

    // Fetch all objects we haven't already grabbed this page session.
    await Promise.all(rest.map(type => dispatch(api[type].all())));
  }

  constructor() {
    super();
    this.renderError = this.renderError.bind(this);
    this.state = { title: '', link: '' };
  }

  renderError() {
    const { errors } = this.props;
    const subject = encodeURIComponent(`${errors.status} ${errors.statusText}`);
    const location = window.location.href;
    const json = JSON.stringify(errors.json, null, 4);
    const body = encodeURIComponent(
      `I'm getting the following error on ${location}:\n\n${json}`);
    const href = `mailto:support@linode.com?subject=${subject}&body=${body}`;
    return (
      <Error status={errors.status} href={href} />
    );
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
    const githubRoot = 'https://github.com/linode/manager/blob/master/';
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
              this.renderError() :
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
                Source
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
