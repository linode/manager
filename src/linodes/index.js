import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import LinodeDetailPage from './layouts/LinodeDetailPage';
import LinodeGeneral from './layouts/LinodeGeneral';
import LinodeNetworking from './layouts/LinodeNetworking';
import CreatePage from './create/layouts/IndexPage';
import BackupsPage from './layouts/BackupsPage';
import RepairPage from './layouts/RepairPage';
import SettingsPage from './settings';

export default (
  <Route path="/linodes">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreatePage} />
    <Route path=":linodeId" component={LinodeDetailPage}>
      <IndexRoute component={LinodeGeneral} />
      <Route path="networking" component={LinodeNetworking} />
      <Route path="rebuild" component={() => <p>TODO</p>} />
      <Route path="resize" component={() => <p>TODO</p>} />
      <Route path="repair" component={RepairPage} />
      <Route path="backups" component={BackupsPage} />
      {SettingsPage}
    </Route>
  </Route>
);
