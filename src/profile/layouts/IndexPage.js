import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';
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
    ].map(t => ({ ...t, link: `/profile${t.link}` }));

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
          onClick={(e, tabIndex) => {
            e.stopPropagation();
            dispatch(push(tabs[tabIndex].link));
          }}
          pathname={location.pathname}
        >{children}</Tabs>
      </div>
    );
  }
}

IndexPage.propTypes = {
  children: PropTypes.node.isRequired,
  dispatch: PropTypes.func,
};

function select(state) {
  // TODO refactor with abstractor changes, see other 'select' method usage in profile/page(s)
  return {
    profile: state.api.profile,
  };
}

export default connect(select)(IndexPage);
