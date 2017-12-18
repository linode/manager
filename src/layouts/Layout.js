import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ExternalLink } from 'linode-components';
import { Error } from 'linode-components';
import { ModalShell } from 'linode-components';

import { hideModal } from '~/actions/modal';
import { hideNotifications } from '~/actions/notifications';
import { hideSession } from '~/actions/session';
import api from '~/api';
import Header from '~/components/Header';
import Notifications from '~/components/notifications/Notifications';
import Banners from '~/components/Banners';
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
      await dispatch(api.profile.one());
      await dispatch(api.banners.one());
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
      banners,
      session,
      events,
      source,
      dispatch,
    } = this.props;
    const { title, link } = this.state;
    const version = VERSION ? `v${VERSION}` : 'master';
    const githubRoot = `https://github.com/linode/manager/blob/${version}/`;
    const params = this.props.params;
    const linodes = this.props.linodes;

    return (
      <div
        className="Layout"
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
        <div className="Layout-inner">
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
          <div className="Main">
            <Banners
              params={params}
              linodes={linodes}
              banners={banners}
            />
            {errors.status ?
              <Error status={errors.status} /> :
              this.props.children}
          </div>
        </div>
        <footer className="Footer text-center">
          <div>
            <span>Version {VERSION}</span>
          </div>
          {!source || !source.source ? null : (
            <ExternalLink
              to={`${githubRoot}${source.source}`}
            >Page Source</ExternalLink>
          )}
        </footer>
      </div>
    );
  }
}

Layout.propTypes = {
  username: PropTypes.string,
  email: PropTypes.string,
  children: PropTypes.node.isRequired,
  params: PropTypes.object,
  errors: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  source: PropTypes.object,
  linodes: PropTypes.object,
  modal: PropTypes.object,
  notifications: PropTypes.object,
  banners: PropTypes.array,
  session: PropTypes.object,
  events: PropTypes.object,
};

function select(state) {
  return {
    username: state.api.profile.username,
    email: state.api.profile.email,
    errors: state.errors,
    source: state.source,
    linodes: state.api.linodes,
    modal: state.modal,
    notifications: state.notifications,
    banners: state.api.banners.data,
    session: state.session,
    events: state.api.events,
  };
}

export default connect(select)(Layout);
