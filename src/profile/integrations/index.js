import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';

const AuthorizedApplicationsPage = () => null;
const MyApplicationsPage = () => null;
const PersonalAccessTokensPage = () => null;

export default (
  <Route path="integrations" component={IndexPage}>
    <IndexRoute component={AuthorizedApplicationsPage} />
    <Route path="applications" component={MyApplicationsPage} />
    <Route path="tokens" component={PersonalAccessTokensPage} />
  </Route>
);
