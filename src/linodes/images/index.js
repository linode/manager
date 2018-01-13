import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import IndexPage from './layouts/IndexPage';

const ImagesIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route exact path={path} component={IndexPage} />
      <Redirect to="/not-found" />
    </Switch >
  );
};

ImagesIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default ImagesIndex;
