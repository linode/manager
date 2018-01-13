import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import IndexPage from './layouts/IndexPage';
import CreatePage from './layouts/CreatePage';
import TicketPage from './layouts/TicketPage';

const SupportIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={CreatePage} path={`${path}/create`} />
      <Route component={TicketPage} path={`${path}/:ticketId`} />
      <Route component={IndexPage} exact path={path} />
      <Redirect to="/not-found" />
    </Switch >
  );
};

SupportIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default SupportIndex;
