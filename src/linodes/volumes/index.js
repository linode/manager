import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import IndexPage from './layouts/IndexPage';

const VolumesIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={IndexPage} exact path={path} />
      <Redirect to="/not-found" />
    </Switch >
  );
};

VolumesIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default VolumesIndex;
