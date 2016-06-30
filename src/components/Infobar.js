import React, { Component } from 'react';
import { rawFetch as fetch } from '~/fetch';

export default class Infobar extends Component {
  constructor() {
    super();
    this.state = { title: null, link: null };
  }

  /* eslint-disable react/no-did-mount-set-state */
  async componentDidMount() {
    if (this.state.title === null) {
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

  render() {
    const { title, link } = this.state;
    return (
      <nav>
        <div className="pull-right">
          {title ?
            <span>
              <span className="new">New</span>
              <a href={link} target="_blank">{title}</a>
            </span>
          : null}
          <a href="https://github.com/linode" target="_blank"><span className="fa fa-github"></span></a>
          <a href="https://twitter.com/linode" target="_blank"><span className="fa fa-twitter"></span></a>
        </div>
      </nav>
    );
  }
}
