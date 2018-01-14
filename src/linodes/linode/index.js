import React, { Component } from 'react';
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

import { setAnalytics } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { ChainedDocumentTitle, GroupLabel } from '~/components';
import { planStyle } from '~/linodes/components/PlanStyle';
import StatusDropdown from '~/linodes/components/StatusDropdown';

import { selectLinode } from './utilities/';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import DashboardPage from './layouts/DashboardPage';
import RebuildPage from './layouts/RebuildPage';
import RescuePage from './layouts/RescuePage';
import ResizePage from './layouts/ResizePage';
import BackupPage from './backups';
import NetworkPage from './networking';
import SettingsPage from './settings';

class LinodeIndex extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['linodes', 'linode']));
  }

  render() {
    const {
      match: { path, url },
      location: { pathname },
      linode,
      type,
      dispatch,
    } = this.props;

    if (!linode) {
      return null;
    }

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
        <div className="container">
          <header className="main-header">
            <div className="float-sm-left">
              <Link to="/linodes">Linodes</Link>
              <h1 title={linode.id}>
                <Link to={`/linodes/${linode.label}`}>
                  <GroupLabel object={linode} />
                </Link>
              </h1>
              <div>{planStyle(type)}</div>
            </div>
            <span className="float-sm-right">
              <StatusDropdown
                shortcuts={false}
                linode={linode}
                short
                dispatch={dispatch}
              />
            </span>
          </header>
        </div>
        <TabsComponent tabs={tabData} />
        <div className="container">
          <Switch>
            <Route path={`${path}/rebuild`} component={RebuildPage} />
            <Route path={`${path}/resize`} component={ResizePage} />
            <Route path={`${path}/rescue`} component={RescuePage} />
            <Route path={`${path}/networking`} component={NetworkPage} />
            <Route path={`${path}/backups`} component={BackupPage} />
            <Route path={`${path}/settings`} component={SettingsPage} />
            <Route exact path={path} component={DashboardPage} />
            <Redirect to="/not-found" />
          </Switch>
        </div>
      </div>
    );
  }
}

LinodeIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  linode: PropTypes.object.isRequired,
  type: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state, props) {
  const { linode } = selectLinode(state, props);
  const type = linode && state.api.types.types[linode.type];
  return { linode, type };
}

const preloadRequest = async (dispatch, { match: { params: { linodeLabel } } }) => {
  await dispatch(api.images.all());
  const { id, type } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
  const requests = [
    api.types.one([type]),
    api.linodes.configs.all([id]),
  ];

  await Promise.all(requests.map(dispatch));
};

export default compose(
  connect(mapStateToProps),
  withRouter,
  Preload(preloadRequest),
)(LinodeIndex);
