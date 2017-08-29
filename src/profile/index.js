import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import AuthenticationPage from './layouts/AuthenticationPage';
import DisplayPage from './layouts/DisplayPage';
import NotificationsPage from './layouts/NotificationsPage';
import ReferralsPage from './layouts/ReferralsPage';
import APITokensPage from './layouts/APITokensPage';
import MyAPIClientsPage from './layouts/MyAPIClientsPage';
import LishPage from './layouts/LishPage';


export default (
  <Route path="/profile" component={IndexPage}>
    <IndexRoute component={DisplayPage} />
    <Route path="authentication" component={AuthenticationPage} />
    <Route path="notifications" component={NotificationsPage} />
    <Route path="referrals" component={ReferralsPage} />
    <Route path="clients" component={MyAPIClientsPage} />
    <Route path="tokens" component={APITokensPage} />
    <Route path="lish" component={LishPage} />
  </Route>
);
