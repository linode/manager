import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';

import { selectLinode } from '../../utilities';


export function IndexPage(props) {
  const { linode } = props;

  const tabs = [
    { name: 'Display', link: '/' },
    { name: 'Alerts', link: '/alerts' },
    { name: 'Advanced', link: '/advanced' },
  ].map(t => ({ ...t, link: `/linodes/${linode.label}/settings${t.link}` }));

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
  linode: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  location: PropTypes.object,
};

export default withRouter(connect(selectLinode)(IndexPage));
