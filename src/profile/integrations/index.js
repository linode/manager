import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import AuthorizedApplicationsPage from './layouts/AuthorizedApplicationsPage';
import MyApplicationsPage from './layouts/MyApplicationsPage';

const PersonalAccessTokensPage = () => null;

export default (
  <Route path="integrations" component={IndexPage}>
    <IndexRoute component={AuthorizedApplicationsPage} />
    <Route path="applications" component={MyApplicationsPage} />
    <Route path="tokens" component={PersonalAccessTokensPage} />
  </Route>
);
