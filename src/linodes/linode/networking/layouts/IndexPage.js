import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';

export class IndexPage extends Component {
  render() {
    const { linode } = this.props;
    if (!linode) return null;

    const tabs = [
      { name: 'Summary', link: '/' },
      { name: 'Reverse DNS', link: '/reversedns' },
      { name: 'IP Management', link: '/ipmanagement' },
    ].map(t => ({ ...t, link: `/linodes/${linode.label}/networking${t.link}` }));

    return (
      <Tabs
        tabs={tabs}
        isSubTabs
        onClick={(e, tabIndex) => {
          e.stopPropagation();
          this.props.dispatch(push(tabs[tabIndex].link));
        }}
        pathname={location.pathname}
      >
        {this.props.children}
      </Tabs>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linode: PropTypes.object.isRequired,
  children: PropTypes.object,
  location: PropTypes.object,
};

export default withRouter(connect(selectLinode)(IndexPage));
