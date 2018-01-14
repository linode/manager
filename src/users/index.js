import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import IndexPage from './layouts/IndexPage';
import UserPage from './user';

const UsersIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={UserPage} path={`${path}/:username`} />
      <Route component={IndexPage} exact path={path} />
      <Redirect to="/not-found" />Î
    </Switch >
  );
};

UsersIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default UsersIndex;
