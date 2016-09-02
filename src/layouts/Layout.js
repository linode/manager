import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import Footer from '../components/Footer';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import Error from '../components/Error';
import { rawFetch as fetch } from '~/fetch';

export class Layout extends Component {
  constructor() {
    super();
    this.renderError = this.renderError.bind(this);
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
    const { username, emailHash, currentPath, errors } = this.props;
    const { title, link } = this.state;
    const year = (new Date()).getFullYear().toString();
    return (
      <div className="layout full-height">
        <Header
          username={username}
          emailHash={emailHash}
          link={link}
          title={title}
        />
        <Sidebar path={currentPath} />
        <div className="main full-height">
          <div className="container">
            <Modal />
            <div className="container-inner">
              {errors.status === null ?
                 this.props.children :
                 this.renderError()}
            </div>
            <Footer year={year} />
          </div>
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  username: PropTypes.string,
  emailHash: PropTypes.string,
  currentPath: PropTypes.string,
  children: PropTypes.node.isRequired,
  errors: PropTypes.object.isRequired,
};

function select(state) {
  return {
    username: state.authentication.username,
    emailHash: state.authentication.emailHash,
    currentPath: state.routing.locationBeforeTransitions.pathname,
    errors: state.errors,
  };
}

export default connect(select)(Layout);
