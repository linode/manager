import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

// import IndexPage from './layouts/IndexPage';
// import RescuePage from './layouts/RescuePage';
// import RebuildPage from './layouts/RebuildPage';
// import ResizePage from './layouts/ResizePage.js';
// import DashboardPage from './layouts/DashboardPage';
// import SettingsPage from './settings';
// import BackupsPage from './backups';
// import NetworkingPage from './networking';
const BlankPage = () => (<div>This page also intentionally left blank.</div>);

const LinodesIndex = ({ match: { url } }) => {
  const routes = [
    { path: url, component: BlankPage, routerComponent: Route },
    { path: `${url}/rebuild`, component: BlankPage, routerComponent: Route },
    { path: `${url}/resize`, component: BlankPage, routerComponent: Route },
    { path: `${url}/rescue`, component: BlankPage, routerComponent: Route },
    { path: `${url}/networking`, component: BlankPage, routerComponent: Route },
    { path: `${url}/backups`, component: BlankPage, routerComponent: Route },
    { path: `${url}/settings`, component: BlankPage, routerComponent: Route },
    { path: url, exact: true, component: BlankPage, routerComponent: Route },
  ];
  return (
    <Switch>
      {
        routes.map(({ routerComponent: RouterComponent, ...props }, key) =>
          React.createElement(RouterComponent, { ...props, key }))
      }
    </Switch>
  );
};

export default withRouter(LinodesIndex);
