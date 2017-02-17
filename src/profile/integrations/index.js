import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import MyApplicationsPage from './layouts/MyApplicationsPage';

const AuthorizedApplicationsPage = () => null;
const PersonalAccessTokensPage = () => null;

export default (
  <Route path="integrations" component={IndexPage}>
    <IndexRoute component={AuthorizedApplicationsPage} />
    <Route path="applications" component={MyApplicationsPage} />
    <Route path="tokens" component={PersonalAccessTokensPage} />
  </Route>
);
