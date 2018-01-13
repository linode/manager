import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import StackScriptsList from './layouts/StackScriptsList';
import StackScriptDetails from './layouts/StackScriptDetails';

const StackScriptsIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={StackScriptDetails} path={`${path}/:stackscriptId`} />
      <Route component={StackScriptsList} exact path={path} />
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
