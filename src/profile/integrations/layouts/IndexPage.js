import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Tabs } from '~/components/tabs';

export function IndexPage(props) {
  const tabs = [
    { name: 'Authorized Applications', link: '' },
    { name: 'My Applications', link: '/applications' },
    { name: 'Personal Access Tokens', link: '/tokens' },
  ].map(t => ({ ...t, link: `/profile/integrations${t.link}` }));

  const pathname = location ? location.pathname : tabs[0].link;
  const selected = tabs.reduce((last, current) =>
    (pathname.indexOf(current.link) === 0 ? current : last));

  return (
    <Tabs
      tabs={tabs}
      selected={selected}
      className="SubTabs"
      onClick={(e, tab) => {
        e.stopPropagation();
        props.dispatch(push(tab.link));
      }}
    >
      {props.children}
    </Tabs>
  );
}

IndexPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func,
};

export default connect()(IndexPage);
