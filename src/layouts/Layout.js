import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { ModalShell } from 'linode-components/modals';
import { Error } from 'linode-components/errors';

import { hideAccount } from '~/actions/account';
import { hideModal } from '~/actions/modal';
import { hideNotifications } from '~/actions/notifications';
import { hideSession } from '~/actions/session';
import AccountMenu from '~/components/AccountMenu';
import Header from '~/components/Header';
import Notifications from '~/components/notifications/Notifications';
import PreloadIndicator from '~/components/PreloadIndicator.js';
import SessionMenu from '~/components/SessionMenu';
import { VERSION } from '~/constants';


export class Layout extends Component {
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
      emailHash,
      errors,
      notifications,
      account,
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
          const { notifications, session, account } = this.props;
          // Gross
          const isListItem = e.target.className.includes('NotificationList-listItem');
          const isSessionMenu = e.target.className.includes('SessionMenu');
          const isAccountMenu = e.target.className.includes('AccountMenu');
          if (notifications.open && !isListItem) {
            dispatch(hideNotifications());
          } else if (account.open && !isAccountMenu) {
            dispatch(hideAccount());
          } else if (session.open && !isSessionMenu) {
            dispatch(hideSession());
          }
        }}
      >
        <PreloadIndicator />
        <Notifications />
        <SessionMenu open={session.open} />
        <AccountMenu open={account.open} />
        <ModalShell
          open={this.props.modal.open}
          title={this.props.modal.title}
          close={() => dispatch(hideModal())}
        >
          {this.props.modal.body}
        </ModalShell>
        <Header
          dispatch={dispatch}
          emailHash={emailHash}
          link={link}
          title={title}
          username={username}
          notifications={notifications}
          account={account}
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
  emailHash: PropTypes.string,
  email: PropTypes.string.isRequired,
  currentPath: PropTypes.string,
  children: PropTypes.node.isRequired,
  errors: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  source: PropTypes.object,
  linodes: PropTypes.object,
  modal: PropTypes.object,
  notifications: PropTypes.object,
  account: PropTypes.object,
  session: PropTypes.object,
  events: PropTypes.object,
};

function select(state) {
  return {
    username: state.authentication.username,
    emailHash: state.authentication.emailHash,
    email: state.authentication.email,
    currentPath: state.routing.locationBeforeTransitions.pathname,
    errors: state.errors,
    source: state.source,
    linodes: state.api.linodes,
    modal: state.modal,
    notifications: state.notifications,
    account: state.account,
    session: state.session,
    events: state.api.events,
  };
}

export default connect(select)(Layout);
