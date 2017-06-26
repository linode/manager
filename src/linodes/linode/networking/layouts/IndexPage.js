import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';

import { getIPs } from '~/api/networking';
import { getObjectByLabelLazily } from '~/api/util';

import { selectLinode } from '../../utilities';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
    await dispatch(getIPs(id));
  }

  render() {
    const { linode } = this.props;

    const tabs = [
      { name: 'Summary', link: '/' },
      { name: 'IP Transfer', link: '/transfer' },
      { name: 'IP Sharing', link: '/sharing' },
      { name: 'DNS Resolvers', link: '/resolvers' },
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
