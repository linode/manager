import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';

import { setAnalytics } from '~/actions';
import api from '~/api';
import { ChainedDocumentTitle } from '~/components';


export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await Promise.all([
      api.account.one(),
      api.invoices.all(),
      api.payments.all(),
    ].map(r => dispatch(r)));
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['billing']));
  }

  render() {
    const tabs = [
      { name: 'Dashboard', link: '' },
      { name: 'Contact Info', link: 'contact' },
      { name: 'Update Credit Card', link: 'creditcard' },
      { name: 'Make A Payment', link: 'payment' },
      { name: 'History', link: 'history' },
    ].map(t => ({ ...t, link: `/billing/${t.link}` }));

    return (
      <div>
        <ChainedDocumentTitle title="Billing" />
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

export default connect()(IndexPage);
