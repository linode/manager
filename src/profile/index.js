import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import AuthenticationPage from './layouts/AuthenticationPage';
import Integrations from './integrations';

const DisplayPage = () => null;
const NotificationsPage = () => null;
const ReferralsPage = () => null;

export default (
  <Route path="/profile" component={IndexPage}>
    <IndexRoute component={DisplayPage} />
    <Route path="authentication" component={AuthenticationPage} />
    <Route path="notifications" component={NotificationsPage} />
    <Route path="referrals" component={ReferralsPage} />
    {Integrations}
  </Route>
);
