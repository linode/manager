import React from 'react';
import {
  Link,
  Redirect,
  Route,
  Switch,
  matchPath,
  withRouter,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import TabsComponent from '~/components/Tabs';

import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { ChainedDocumentTitle, GroupLabel } from '~/components';
import { planStyle } from '~/linodes/components/PlanStyle';
import StatusDropdown from '~/linodes/components/StatusDropdown';

import { selectLinode } from './utilities/';
import { ComponentPreload as Preload } from '~/decorators/Preload';
import DashboardPage from './layouts/DashboardPage';
import ResizePage from './layouts/ResizePage';
import RescuePage from './layouts/RescuePage';
import RebuildPage from './layouts/RebuildPage';

const LinodeIndex = (props) => {
  const {
    match: { path, url },
    location: { pathname },
    linode,
    dispatch,
  } = props;

  const matched = (path, options) => Boolean(
    matchPath(pathname, { path, ...options })
  );

  const tabData = [
    { name: 'Dashboard', to: url, selected: matched(url, { exact: true }) },
    { name: 'Networking', to: `${url}/networking`, selected: matched(`${url}/networking`) },
    { name: 'Rebuild', to: `${url}/rebuild`, selected: matched(`${url}/rebuild`) },
    { name: 'Resize', to: `${url}/resize`, selected: matched(`${url}/resize`) },
    { name: 'Rescue', to: `${url}/rescue`, selected: matched(`${url}/rescue`) },
    { name: 'Backups', to: `${url}/backups`, selected: matched(`${url}/backups`) },
    { name: 'Settings', to: `${url}/settings`, selected: matched(`${url}/settings`) },
  ];

  return (
    <div>
      <ChainedDocumentTitle title={linode.label} />
      <header className="main-header">
        <div className="container">
          <div className="float-sm-left">
            <Link to="/linodes">Linodes</Link>
            <h1 title={linode.id}>
              <Link to={`/linodes/${linode.label}`}>
                <GroupLabel object={linode} />
              </Link>
            </h1>
            <div>{planStyle(linode.type)}</div>
          </div>
          <span className="float-sm-right">
            <StatusDropdown
              shortcuts={false}
              linode={linode}
              short
              dispatch={dispatch}
            />
          </span>
        </div>
      </header>
      <TabsComponent tabs={tabData} />
      <Switch>
        <Route path={`${path}/rebuild`} component={RebuildPage} />
        <Route path={`${path}/resize`} component={ResizePage} />
        <Route path={`${path}/rescue`} component={RescuePage} />
        <Route path={`${path}/networking`} component={() => <div className="container"><h1>networking</h1></div>} />
        <Route path={`${path}/backups`} component={() => <div className="container"><h1>backups</h1></div>} />
        <Route path={`${path}/settings`} component={() => <div className="container"><h1>settings</h1></div>} />
        <Route exact path={path} component={DashboardPage} />
        <Redirect to="/not-found" />
      </Switch>
    </div>
  );
};

LinodeIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const preloadRequest = async (dispatch, { match: { params: { linodeLabel } } }) => {
  const { id, type } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
  const requests = [
    api.types.one([type.id]),
    api.linodes.configs.all([id]),
  ];

  await Promise.all(requests.map(dispatch));
};

export default compose(
  connect(selectLinode),
  withRouter,
  Preload(preloadRequest),
)(LinodeIndex);
