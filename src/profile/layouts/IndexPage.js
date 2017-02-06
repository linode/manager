import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Tabs } from '~/components/Tabs';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';

export class IndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('My Profile'));
  }

  render() {
    const { dispatch, children } = this.props;

    const tabs = [
      { name: 'Display', link: '' },
      { name: 'Password & Authentication', link: '/authentication' },
      { name: 'Integrations', link: '/integrations' },
      { name: 'Notifications', link: '/notifications' },
      { name: 'Referrals', link: '/referrals' },
      { name: 'Lish Settings', link: '/lish' },
    ].map(t => ({ ...t, link: `/profile${t.link}` }));

    const pathname = location ? location.pathname : tabs[0].link;
    const selected = tabs.reduce((knownIndex, { link }, currentIndex) =>
      pathname.indexOf(link) === 0 ? currentIndex : knownIndex, 0);

    return (
      <div>
        <header className="main-header">
          <div className="container">
            <h1>My Profile</h1>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <Tabs
          tabs={tabs}
          selected={selected}
          onClick={(e, tab) => {
            e.stopPropagation();
            dispatch(push(tab.link));
          }}
        >{children}</Tabs>
      </div>
    );
  }
}

IndexPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func,
};

export default connect()(IndexPage);
