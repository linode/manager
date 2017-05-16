import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';

import { setError } from '~/actions/errors';
import { linodes } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';

import { selectLinode } from '../../utilities';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    if (window.location.pathname.indexOf('/settings/advanced') === -1) {
      // No need to preload disks.
      return;
    }

    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

    try {
      await dispatch(linodes.disks.all([id]));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  render() {
    const { linode } = this.props;
    if (!linode) return null;

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
  children: PropTypes.node.isRequired,
  location: PropTypes.object,
};

export default withRouter(connect(selectLinode)(IndexPage));
