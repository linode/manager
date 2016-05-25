import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import LinodeDetailPage from './layouts/LinodeDetailPage';
import CreateLinodePage from './layouts/CreateLinodePage';

export default (
  <Route path="/linodes">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreateLinodePage} />
    <Route path=":linodeId" component={LinodeDetailPage} />
  </Route>
);
