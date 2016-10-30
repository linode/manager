import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import Header from '~/components/Header';
import Sidebar from '~/components/Sidebar';
import Notifications from '~/components/Notifications';
import Modal from '~/components/Modal';
import Error from '~/components/Error';
import Feedback from '~/components/Feedback';
import { rawFetch as fetch } from '~/fetch';
import { hideModal } from '~/actions/modal';
import { showNotifications, hideNotifications } from '~/actions/notifications';
import { showFeedback, hideFeedback } from '~/actions/feedback';

export class Layout extends Component {
  constructor() {
    super();
    this.renderError = this.renderError.bind(this);
    this.hideShowNotifications = this.hideShow(
      'notifications', hideNotifications, showNotifications).bind(this);
    this.hideShowFeedback = this.hideShow(
      'feedback', hideFeedback, showFeedback).bind(this);
    this.state = { title: '', link: '' };
  }

  /* eslint-disable react/no-did-mount-set-state */
  async componentDidMount() {
    if (this.state.title === '') {
      try {
        const resp = await fetch('https://blog.linode.com/feed/', {
          mode: 'cors',
        });
        const parser = new DOMParser();
        const xml = parser.parseFromString(await resp.text(), 'text/xml');
        const latest = xml.querySelector('channel item');
        const title = latest.querySelector('title').textContent;
        const link = latest.querySelector('link').textContent;
        this.setState({ title, link });
      } catch (ex) {
        // Whatever
      }
    }
  }

  hideShow(type, hide, show) {
    return async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { dispatch, [type]: { open } } = this.props;
      if (open) {
        await dispatch(hide());
      } else {
        await dispatch(hideModal());
        await dispatch(show());
      }
    };
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
    const { username, email, emailHash, currentPath, errors, source } = this.props;
    const { title, link } = this.state;
    const githubRoot = 'https://github.com/linode/manager/blob/master/';
    return (
      <div className="layout full-height">
        <Header
          username={username}
          emailHash={emailHash}
          link={link}
          title={title}
          hideShowNotifications={this.hideShowNotifications}
        />
        <Sidebar path={currentPath} />
        <Notifications
          open={this.props.notifications.open}
          hideShowNotifications={this.hideShowNotifications}
        />
        <Feedback
          email={email}
          open={this.props.feedback.open}
          hideShowFeedback={this.hideShowFeedback}
          submitFeedback={() => {}}
        />
        <div className="main full-height">
          <Modal />
          {!errors.status ?
           this.props.children :
           this.renderError()}
          <footer className="text-xs-center">
            {!source || !source.source ? null :
              <a
                target="__blank"
                rel="noopener"
                href={`${githubRoot}${source.source}`}
              >
                Source
              </a>
            }
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
  notifications: PropTypes.object.isRequired,
  feedback: PropTypes.object.isRequired,
  source: PropTypes.object,
};

function select(state) {
  return {
    username: state.authentication.username,
    emailHash: state.authentication.emailHash,
    email: state.authentication.email,
    currentPath: state.routing.locationBeforeTransitions.pathname,
    notifications: state.notifications,
    feedback: state.feedback,
    errors: state.errors,
    source: state.source,
  };
}

export default connect(select)(Layout);
