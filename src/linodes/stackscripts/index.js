import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import IndexPage from './layouts/IndexPage';
import StackScriptPage from './layouts/StackScriptPage';

const StackScriptsIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={StackScriptPage} path={`${path}/:stackscriptId`} />
      <Route component={IndexPage} exact path={path} />
      <Redirect to="/not-found" />
    </Switch >
  );
};

StackScriptsIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default StackScriptsIndex;
