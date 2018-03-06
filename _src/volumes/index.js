import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import VolumesList from './layouts/VolumesList';

const VolumesIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={VolumesList} exact path={path} />
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
