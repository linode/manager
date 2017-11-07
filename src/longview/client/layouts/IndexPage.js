import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

import { Tabs } from 'linode-components/tabs';

import { setAnalytics, setTitle } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { selectLVClient } from '../utilities';

export class IndexPage extends Component {
  async componentDidMount() {
    const { dispatch, lvclient } = this.props;
    // @todo fix this  - label not ready yet
    
    dispatch(setTitle(lvclient.label));
    dispatch(setAnalytics(['lvclients', 'lvclient']));
  }

  render() {
    const { lvclient } = this.props;

    if (!lvclient) { return null; }

    const tabs = [
      { name: 'Dashboard', link: '' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/longview/${encodeURIComponent(lvclient.label)}${t.link}` }));

    return (
      <div>
        <header className="main-header">
          <div className="container">
            <div className="float-sm-left">
              <Link to="/longview">Longview Clients</Link>
              <h1 title={lvclient.id}>
                <Link to={`/longview/${lvclient.label}`} />
              </h1>
            </div>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <Tabs
          tabs={tabs}
          onClick={(e, tabIndex) => {
            e.stopPropagation();
            this.props.dispatch(push(tabs[tabIndex].link));
          }}
          pathname={location.pathname}
        >
          {this.props.children}
        </Tabs>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  lvclient: PropTypes.object,
  children: PropTypes.node.isRequired,
};

export default connect(selectLVClient)(IndexPage);
