import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { Tabs } from 'linode-components';
import { compose } from 'redux';

import Breadcrumbs from '~/components/Breadcrumbs';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import { setAnalytics } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { ChainedDocumentTitle, GroupLabel } from '~/components';


export class IndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['nodebalancers', 'nodebalancer']));
  }

  render() {
    const { nodebalancer } = this.props;
    if (!nodebalancer) return null;

    const { label } = nodebalancer;
    const tabs = [
      { name: 'Dashboard', link: `/nodebalancers/${label}` },
      { name: 'Settings', link: `/nodebalancers/${label}/settings` },
    ];

    return (
      <div>
        <ChainedDocumentTitle title={nodebalancer.label} />
        <header className="main-header">
          <div className="container clearfix">
            <div className="float-sm-left">
              <Breadcrumbs crumbs={[{ to: '/nodebalancers', label: 'NodeBalancers' }]} />
              <h1 title={nodebalancer.id}>
                <Link to={`/nodebalancers/${nodebalancer.label}`}>
                  <GroupLabel object={nodebalancer} />
                </Link>
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
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
  children: PropTypes.node,
};

function mapStateToProps(state, props) {
  const { nodebalancers } = state.api.nodebalancers;
  const { nbLabel } = props.params;
  const nodebalancer = objectFromMapByLabel(Object.values(nodebalancers), nbLabel);
  return { nodebalancer };
}

const preloadRequest = async (dispatch, props) => {
  const { params: { nbLabel } } = props;
  const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
  await dispatch(api.nodebalancers.configs.all([id]));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(IndexPage);
