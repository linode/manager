import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Tabs from '~/components/Tabs';

export function IndexPage(props) {
  const tabs = [
    { name: 'Authorized Applications', link: '' },
    { name: 'My Applications', link: '/applications' },
    { name: 'Personal Access Tokens', link: '/tokens' },
  ].map(t => ({ ...t, link: `/profile/integrations${t.link}` }));

  const pathname = location ? location.pathname : tabs[0].link;
  const selected = tabs.reduce((knownIndex, { link }, currentIndex) =>
    pathname.indexOf(link) === 0 ? currentIndex : knownIndex, 0);

  return (
    <Tabs
      tabs={tabs}
      selected={selected}
      isSubTabs
      onClick={(e, tabIndex) => {
        e.stopPropagation();
        props.dispatch(push(tabs[tabIndex].link));
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
