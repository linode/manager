import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';

export function IndexPage(props) {
  const tabs = [
    { name: 'Authorized Applications', link: '' },
    { name: 'My Applications', link: '/applications' },
    { name: 'Personal Access Tokens', link: '/tokens' },
  ].map(t => ({ ...t, link: `/profile/integrations${t.link}` }));

  return (
    <Tabs
      tabs={tabs}
      isSubTabs
      onClick={(e, tabIndex) => {
        e.stopPropagation();
        props.dispatch(push(tabs[tabIndex].link));
      }}
      pathname={location.pathname}
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
