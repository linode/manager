import React from 'react';
import { Router, Route } from 'react-router';

import App from './containers/App';
import CounterPage from './containers/CounterPage';

const routes = (
  <Router>
    <Route path="/" component={App} />
    <Route path="/counter" component={CounterPage} />
  </Router>
);

export default routes;
