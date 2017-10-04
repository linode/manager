import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

import { Tabs } from 'linode-components/tabs';

import { setAnalytics, setTitle } from '~/actions';
import { getObjectByLabelLazily } from '~/api/util';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
  }

  constructor(props) {
    super(props);

  }

  async componentDidMount() {
    const { dispatch, linode } = this.props;
    dispatch(setTitle('Billing'));
    dispatch(setAnalytics('billing'));
  }

  render() {
    const tabs = [
      { name: 'Dashboard', link: '' },
    ].map(t => ({ ...t, link: `/billing/${t.link}` }));

    return (
      <div>
        <header className="main-header">
          <div className="container">
            <h1 className="float-sm-left">Billing</h1>
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
  children: PropTypes.node.isRequired,
};

function select(state, props) {
  return { };
}

export default connect(select)(IndexPage);
