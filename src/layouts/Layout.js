import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { EVENT_POLLING_DELAY } from '~/constants';
import { events } from '~/api';
import { Event } from '~/api/objects/Event';
import { actions as eventsActions } from '~/api/configs/events';
import { eventRead, eventSeen } from '~/api/events';
import Header from '~/components/Header';
import Sidebar from '~/components/Sidebar';
import Notifications, { sortNotifications } from '~/components/Notifications';
import { Modal } from '~/components/modal';
import Error from '~/components/Error';
import Feedback from '~/components/Feedback';
import { rawFetch as fetch } from '~/fetch';
import { hideModal } from '~/actions/modal';
import { showNotifications, hideNotifications } from '~/actions/notifications';
import { showFeedback, hideFeedback } from '~/actions/feedback';
import { actions as linodeActions } from '~/api/configs/linodes';

export class Layout extends Component {
  constructor() {
    super();
    this.eventHandler = this.eventHandler.bind(this);
    this.renderError = this.renderError.bind(this);
    this.hideShowNotifications = this.hideShow(
      'notifications', hideNotifications, showNotifications).bind(this);
    this.hideShowFeedback = this.hideShow(
      'feedback', hideFeedback, showFeedback).bind(this);
    this.state = { title: '', link: '' };
  }

  componentDidMount() {
    this.fetchBlog();
    this.attachEventTimeout();
  }

  componentWillUnmount() {
    this._shouldPoll = false;
  }

  async fetchBlog() {
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
        // TODO
      }
    }
  }

  eventHandler(_event) {
    const { dispatch, linodes } = this.props;
    const event = new Event(_event);

    switch (event.getType()) {
      case Event.LINODE_REBOOT:
      case Event.LINODE_BOOT:
      case Event.LINODE_POWER_OFF: {
        const linode = linodes.linodes[event.getLinodeId()];
        if (linode) {
          // Give a 1 second allowance.
          linode.__updatedAt.setSeconds(linode.__updatedAt.getSeconds() - 1);
          const newEvent = event.getUpdatedAt() > linode.__updatedAt;
          const statusChanged = linode.status !== event.getStatus();
          const changeInProgress = event.getProgress() < 100;
          const progressMade = linode.__progress < event.getProgress();

          if (newEvent && (statusChanged || changeInProgress && progressMade)) {
            dispatch(linodeActions.one({
              ...linode,
              __progress: event.getProgress(),
            }, linode.id));

            setTimeout(() => dispatch(linodeActions.one({
              ...linode,
              status: event.getStatus(),
              // For best UX, keep the below timeout length the same as the width transition for
              // this component.
            }, linode.id)), 1000);
          }
        }
        break;
      }
      default:
        break;
    } // TODO: handle other cases

    return _event;
  }

  async fetchEventsPage(page = 0, processedEvents = { events: [] }) {
    const { dispatch } = this.props;
    const nextProcessedEvents = await dispatch(events.page(page, [], this.eventHandler, false));
    // If all the events are new, we want to fetch another page.
    const allUnseen = nextProcessedEvents.events.reduce((allUnseenEvents, { seen }) =>
      !seen && allUnseenEvents, true) && nextProcessedEvents.events.length;

    const allProcessedEvents = {
      ...nextProcessedEvents,
      events: processedEvents.events.concat(nextProcessedEvents.events),
    };
    if (allUnseen) {
      return this.fetchEventsPage(page + 1, allProcessedEvents);
    }

    return allProcessedEvents;
  }

  async attachEventTimeout() {
    const { dispatch } = this.props;

    // OAuth token is not available during the callback
    while (window.location.pathname === '/oauth/callback') {
      await new Promise(r => setTimeout(r, 100));
    }

    // Grab events first time right away
    this._shouldPoll = true;
    dispatch(events.all([], this.eventHandler));

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this._shouldPoll) {
        // And every N seconds
        await new Promise(resolve => setTimeout(resolve, EVENT_POLLING_DELAY));

        const processedEvents = await this.fetchEventsPage(0);
        try {
          dispatch(eventsActions.many(processedEvents));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }
    }
  }

  hideShow(type, hide, show) {
    return async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { dispatch, [type]: { open }, events } = this.props;
      if (open) {
        dispatch(hide());
      } else {
        const sortedEvents = sortNotifications(events);
        if (type === 'notifications' && sortedEvents[0] && !sortedEvents[0].seen) {
          dispatch(eventSeen(sortedEvents[0].id));
        }
        dispatch(hideModal());
        dispatch(show());
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
    const { username, email, emailHash, currentPath, errors, source, dispatch } = this.props;
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
          events={this.props.events}
        />
        <Sidebar path={currentPath} />
        <Notifications
          open={this.props.notifications.open}
          hideShowNotifications={this.hideShowNotifications}
          gotoPage={async (page) => await dispatch(push(page))}
          readNotification={async (id) => await dispatch(eventRead(id))}
          events={this.props.events}
          linodes={this.props.linodes}
        />
        <Feedback
          email={email}
          open={this.props.feedback.open}
          hideShowFeedback={this.hideShowFeedback}
          submitFeedback={() => {}}
        />
        <div className="main full-height">
          <Modal />
          <div className="main-inner">
            {!errors.status ?
              this.props.children :
              this.renderError()}
          </div>
          <footer className="footer text-xs-center">
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
  events: PropTypes.object,
  linodes: PropTypes.object,
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
    events: state.api.events,
    linodes: state.api.linodes,
  };
}

export default connect(select)(Layout);
