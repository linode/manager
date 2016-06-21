import React from 'react';
import { Route, IndexRoute } from 'react-router';

import IndexPage from './layouts/IndexPage';
import LinodeDetailPage from './layouts/LinodeDetailPage';
import LinodeGeneral from './layouts/LinodeGeneral';
import CreateLinodePage from './layouts/CreateLinodePage';
import BackupsPage from './layouts/BackupsPage';
import SettingsPage from './layouts/SettingsPage';

/* eslint-disable react/prop-types */
function Placeholder(props) {
  const { pathname } = props.location;
  return <div>{pathname} placeholder</div>;
}

export default (
  <Route path="/linodes">
    <IndexRoute component={IndexPage} />
    <Route path="create" component={CreateLinodePage} />
    <Route path=":linodeId" component={LinodeDetailPage}>
      <IndexRoute component={LinodeGeneral} />
      <Route path="networking" component={Placeholder} />
      <Route path="resize" component={Placeholder} />
      <Route path="repair" component={Placeholder} />
      <Route path="backups" component={BackupsPage} />
      <Route path="settings" component={SettingsPage}>
        <IndexRoute component={Placeholder} />
        <Route path="alerts" component={Placeholder} />
        <Route path="advanced" component={Placeholder} />
      </Route>
    </Route>
  </Route>
);
