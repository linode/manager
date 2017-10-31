import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';

import { selectLVClient } from '../../utilities';


export function IndexPage(props) {
  const { lvclient } = props;

  const tabs = [
    { name: 'Display', link: '/' },
    { name: 'Install', link: '/install' },
  ].map(t => ({ ...t, link: `/longview/${encodeURIComponent(lvclient.label)}/settings${t.link}` }));

  return (
    <Tabs
      tabs={tabs}
      isSubTabs
      onClick={(e, tabIndex) => {
        e.stopPropagation();
        props.dispatch(push(tabs[tabIndex].link));
      }}
      pathname={location.pathname}
    >{props.children}</Tabs>
  );
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  lvclient: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  location: PropTypes.object,
};

export default withRouter(connect(selectLVClient)(IndexPage));
