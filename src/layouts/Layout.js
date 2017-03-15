import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import Header from '~/components/Header';
import Sidebar from '~/components/Sidebar';
import { ModalShell } from '~/components/modals';
import Error from '~/components/Error';
import { EventTypeMap } from '~/components/notifications';
import PreloadIndicator from '~/components/PreloadIndicator.js';
import { rawFetch as fetch } from '~/fetch';
import { hideModal } from '~/actions/modal';
import { hideNotifications } from '~/actions/notifications';
import { actions as linodeActions } from '~/api/configs/linodes';


export class Layout extends Component {
  constructor() {
    super();
    this.eventHandler = this.eventHandler.bind(this);
    this.renderError = this.renderError.bind(this);
    this.state = { title: '', link: '' };
  }

  componentDidMount() {
    this.fetchBlog();
    this.attachEventTimeout();
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

  // TODO: decouple this from events and layout, use explicit poll from /linode on status change
  eventHandler(event) {
    const { dispatch, linodes } = this.props;

    // handles linode events and display status changes
    const linodeStatus = EventTypeMap[event.action].linodeStatus;
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

  async attachEventTimeout() {
    // OAuth token is not available during the callback
    while (window.location.pathname === '/oauth/callback') {
      await new Promise(r => setTimeout(r, 100));
    }
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
      currentPath,
      errors,
      notifications,
      source,
      dispatch,
    } = this.props;
    const { title, link } = this.state;
    const githubRoot = 'https://github.com/linode/manager/blob/master/';
    return (
      <div
        className={`layout full-height ${this.props.modal.open ? 'layout--modal' : ''}`}
        onClick={(e) => {
          const open = this.props.notifications.open;
          const isListItem = e.target.className.includes('NotificationList-listItem');
          if (open && !isListItem) {
            dispatch(hideNotifications());
          }
        }}
      >
        <PreloadIndicator />
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
          eventHandler={this.eventHandler}
        />
        <Sidebar path={currentPath} />
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
  source: PropTypes.object,
  linodes: PropTypes.object,
  modal: PropTypes.object,
  notifications: PropTypes.object,
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
  };
}

export default connect(select)(Layout);
