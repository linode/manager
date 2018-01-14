import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import DomainsList from './layouts/DomainsList';
import DomainDetails from './layouts/DomainDetails';

const DomainsIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={DomainDetails} path={`${path}/:domainLabel`} />
      <Route component={DomainsList} exact path={`${path}/`} />
      <Redirect to="/not-found" />
    </Switch >
  );
};

DomainsIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default DomainsIndex;
