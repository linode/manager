import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import TicketsList from './layouts/TicketsList';
import TicketCreate from './layouts/TicketCreate';
import TicketDetails from './layouts/TicketDetails';

const SupportIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={TicketCreate} path={`${path}/create`} />
      <Route component={TicketDetails} path={`${path}/:ticketId`} />
      <Route component={TicketsList} exact path={path} />
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
