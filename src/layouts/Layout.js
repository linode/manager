import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { VERSION } from '~/constants';
import Header from '~/components/Header';
import Sidebar from '~/components/Sidebar';
import { ModalShell } from '~/components/modals';
import Error from '~/components/Error';
import PreloadIndicator from '~/components/PreloadIndicator.js';
import { rawFetch as fetch } from '~/fetch';
import { hideModal } from '~/actions/modal';
import { hideNotifications } from '~/actions/notifications';


export class Layout extends Component {
  constructor() {
    super();
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
        />
        <Sidebar path={currentPath} />
        <div className="main full-height">
          <div className="main-inner">
            {!errors.status ?
              this.props.children :
              this.renderError()}
          </div>
          <footer className="footer text-xs-center">
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
