import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import ImagesList from './layouts/ImagesList';

const ImagesIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route exact path={path} component={ImagesList} />
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
