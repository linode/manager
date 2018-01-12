import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import ListLinodesPage from '~/linodes/layouts/ListLinodes';
import LinodeIndex from './linode/index';
import NotFound from 'linode-components/dist/errors/NotFound';

const LinodesIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={LinodeIndex} path={`${path}/:linodeLabel`} />
      <Route component={ListLinodesPage} exact path={`${path}/`} />
      <Route component={NotFound} />
    </Switch >
  );
};

LinodesIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default LinodesIndex;
