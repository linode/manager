import React, { PropTypes } from 'react';
import { push } from 'react-router-redux';

import { Tabs } from '~/components/tabs';

export default function IndexPage() {
  const tabs = [
    { name: 'Display', link: '' },
    { name: 'Password & Authentication', link: '/authentication' },
    { name: 'Integrations', link: '/integrations' },
    { name: 'Notifications', link: '/notifications' },
    { name: 'Referrals', link: '/referrals' },
  ].map(t => ({ ...t, link: `/profile${t.link}` }));

  const pathname = location ? location.pathname : tabs[0].link;
  const selected = tabs.reduce((last, current) =>
    (pathname.indexOf(current.link) === 0 ? current : last));

  return (
    <div>
      <header className="main-header">
        <div className="container">
          <h1>My profile</h1>
        </div>
      </header>
      <div className="main-header-fix"></div>
      <Tabs
        tabs={tabs}
        selected={selected}
        onClick={(e, tab) => {
          e.stopPropagation();
          this.props.dispatch(push(tab.link));
        }}
      >
        <div className="container">
          {this.props.children}
        </div>
      </Tabs>
    </div>
  );
}

IndexPage.propTypes = {
  children: PropTypes.node.isRequired,
};
