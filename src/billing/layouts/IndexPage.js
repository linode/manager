import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';

import { setAnalytics, setSource, setTitle } from '~/actions';


export class IndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Billing'));
    dispatch(setAnalytics(['billing']));
  }

  render() {
    const { dispatch, children } = this.props;

    const tabs = [
      { name: 'Dashboard', link: '' },
    ].map(function (tab) {
      return {
        ...tab,
        link: `/billing${tab.link}`,
      };
    });

    return (
      <div>
        <header className="main-header">
          <div className="container">
            <h1>Billing</h1>
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

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps)(IndexPage);
