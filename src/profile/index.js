import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import AuthenticationPage from './layouts/AuthenticationPage';

const DisplayPage = () => null;
const IntegrationsPage = () => null;
const NotificationsPage = () => null;
const ReferralsPage = () => null;

export default (
  <Route path="/profile" component={IndexPage}>
    <IndexRoute component={DisplayPage} />
    <Route path="authentication" component={AuthenticationPage} />
    <Route path="integrations" component={IntegrationsPage} />
    <Route path="notifications" component={NotificationsPage} />
    <Route path="referrals" component={ReferralsPage} />
  </Route>
);
