import React from 'react';
import { Route, Switch, matchPath, Redirect } from 'react-router-dom';
import TabsComponent from '~/components/Tabs';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import api from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { selectLinode } from '../utilities/selectLinode';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import AlertsPage from './layouts/Alertspage';
import DisplayPage from './layouts/DisplayPage';
import EditConfigPage from './advanced/layouts/EditConfigPage';
import AdvancedPage from './advanced/layouts/AdvancedPage';
import AddConfigPage from './advanced/layouts/AddConfigPage';

const LinodeSettingsIndex = (props) => {
  const {
    match: { url, path },
    location: { pathname },
  } = props;

  const matched = (path, options) => Boolean(
    matchPath(pathname, { path, ...options })
  );

  const tabs = [
    { name: 'Display', to: url, selected: matched(url, { exact: true }) },
    { name: 'Alerts', to: `${url}/alerts`, selected: matched(`${url}/alerts`) },
    { name: 'Advanced', to: `${url}/advanced`, selected: matched(`${url}/advanced`) },
  ];

  return (
    <div>
      <TabsComponent tabs={tabs} parentClass="linode-tabs--sub" />
      <ChainedDocumentTitle title="Settings" />
      <Switch>
        <Route path={`${path}/alerts`} component={AlertsPage} />
        <Route path={`${path}/advanced/configs/create`} component={AddConfigPage} />
        <Route path={`${path}/advanced/configs/:configId`} component={EditConfigPage} />
        <Route exact path={`${path}/advanced`} component={AdvancedPage} />
        <Route exact component={DisplayPage} />
        <Redirect to="/not-found" />
      </Switch>
    </div>
  );
};

LinodeSettingsIndex.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = (state, props) => {
  const { linodes } = selectLinode(state, props);
  return {
    linodes,
    kernels: state.api.kernels,
  };
};

const preloadRequest = async (dispatch, { match: { params: { linodeLabel } } }) => {
  const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

  const requests = [
    api.linodes.disks.all([id]),
    api.linodes.volumes.all([id]),
    api.kernels.page(0),
    api.images.all(),
  ];

  await Promise.all(requests.map(r => dispatch(r)));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest),
)(LinodeSettingsIndex);
