import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { EVENT_POLLING_DELAY } from '~/constants';
import { events } from '~/api';
import { EventTypeMap } from '~/components/notifications';

import { actions as eventsActions } from '~/api/configs/events';
import { eventRead, eventSeen } from '~/api/events';
import Header from '~/components/Header';
import Sidebar from '~/components/Sidebar';
import { NotificationList } from '~/components/notifications';
import { ModalShell } from '~/components/modals';
import Error from '~/components/Error';
import Feedback from '~/components/Feedback';
import PreloadIndicator from '~/components/PreloadIndicator.js';
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
    this._pollingTimeoutId = null;
    this.state = { title: '', link: '' };
  }

  componentDidMount() {
    this.fetchBlog();
    this.attachEventTimeout();
  }

  componentWillUnmount() {
    this.stopPollingForEvents();
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

  eventHandler(event) {
    const { dispatch, linodes } = this.props;

    const linodeStatus = EventTypeMap[event.type].linodeStatus;
    if (event.linode_id && linodeStatus) {
      const linode = linodes.linodes[event.linode_id];
      if (linode) {
        const updatedAt = new Date(event.updated);
        const progress = Math.min(event.percent_complete, 100);

        // Give a 1 second allowance.
        linode.__updatedAt.setSeconds(linode.__updatedAt.getSeconds() - 1);
        const newEvent = updatedAt > linode.__updatedAt;
        const statusChanged = linode.status !== linodeStatus;
        const changeInProgress = progress < 100;
        const progressMade = linode.__progress < progress;

        if (newEvent && (statusChanged || changeInProgress && progressMade)) {
          dispatch(linodeActions.one({
            __progress: progress,
          }, linode.id));

          if (progress === 100) {
            setTimeout(() => dispatch(linodeActions.one({
              status: linodeStatus,
              // For best UX, keep the below timeout length the same as the width transition for
              // this component.
            }, linode.id)), 1000);
          }
        }
      }
    }

    return event;
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

  pollForEvents() {
    const { dispatch } = this.props;

    this._pollingTimeoutId = setTimeout(async () => {
      const processedEvents = await this.fetchEventsPage(0);

      try {
        dispatch(eventsActions.many(processedEvents));
        this.pollForEvents();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }, EVENT_POLLING_DELAY);
  }

  stopPollingForEvents() {
    clearTimeout(this._pollingTimeoutId);
    this._pollingTimeoutId = null;
  }

  async attachEventTimeout() {
    const { dispatch } = this.props;

    // OAuth token is not available during the callback
    while (window.location.pathname === '/oauth/callback') {
      await new Promise(r => setTimeout(r, 100));
    }

    // Grab events first time right away
    dispatch(events.all([], this.eventHandler));

    this.pollForEvents();
  }

  hideShow(type, hide, show) {
    return async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { dispatch, [type]: { open } } = this.props;
      if (open) {
        dispatch(hide());
      } else {
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
      <div className="layout full-height" onClick={(e) => {
        if (this.props.notifications.open && !e.target.className.includes('NotificationList-listItem')) {
          dispatch(hideNotifications());
        }
      }}>
        <PreloadIndicator />
        <ModalShell
          open={this.props.modal.open}
          title={this.props.modal.title}
          close={() => dispatch(hideModal())}
        >
          {this.props.modal.body}
        </ModalShell>
        <Header
          username={username}
          emailHash={emailHash}
          link={link}
          title={title}
          hideShowNotifications={this.hideShowNotifications}
          events={this.props.events}
          notificationsOpen={this.props.notifications.open}
        />
        <Sidebar path={currentPath} />
        <NotificationList
          open={this.props.notifications.open}
          onClickItem={async (event) => {
            dispatch(hideNotifications());

            if (!event.read) {
              await dispatch(eventRead(event.id));
            }
          }}
          events={this.props.events}
          eventSeen={(id) => dispatch(eventSeen(id))}
        />
        <Feedback
          email={email}
          open={this.props.feedback.open}
          hideShowFeedback={this.hideShowFeedback}
          submitFeedback={() => {}}
        />
        <div className="main full-height">
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
  notifications: PropTypes.object.isRequired,
  feedback: PropTypes.object.isRequired,
  source: PropTypes.object,
  events: PropTypes.object,
  linodes: PropTypes.object,
  modal: PropTypes.object,
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
    modal: state.modal,
  };
}

export default connect(select)(Layout);
