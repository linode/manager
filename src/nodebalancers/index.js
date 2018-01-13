import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import NodeBalancersListPage from './layouts/NodeBalancersListPage';
import NodebalancerPage from './nodebalancer';
import Configs from './nodebalancer/configs';
import AddConfigPage from './nodebalancer/layouts/AddConfigPage';

const NodeBalancersIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={Configs} path={`${path}/:nbLabel/configs/:configId`} />
      <Route exact component={AddConfigPage} path={`${path}/:nbLabel/configs/create`} />
      <Route component={NodebalancerPage} path={`${path}/:nbLabel`} />
      <Route component={NodeBalancersListPage} exact path={`${path}/`} />
      <Redirect to="/not-found" />
    </Switch >
  );
};

NodeBalancersIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default NodeBalancersIndex;
