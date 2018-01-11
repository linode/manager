import React from 'react';
import { Route, Switch, matchPath, Redirect } from 'react-router-dom';
import TabsComponent from '~/components/Tabs';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { ComponentPreload as Preload } from '~/decorators/Preload';
import { connect } from 'react-redux';
import { compose } from 'redux';

import api from '~/api';
import { ipv4s, getIPs } from '~/api/ad-hoc/networking';
import {
  createHeaderFilter,
  getObjectByLabelLazily,
} from '~/api/util';

import DNSResolversPage from './layouts/DNSResolversPage';
import IPSharingPage from './layouts/IPSharingPage';
import IPTransferPage from './layouts/IPTransferPage';
import SummaryPage from './layouts/SummaryPage';

const LinodeNetworkingIndex = (props) => {
  const {
    match: { url, path },
    location: { pathname },
  } = props;

  const matched = (path, options) => Boolean(
    matchPath(pathname, { path, ...options })
  );

  const tabs = [
    { name: 'Summary', to: url, selected: matched(url, { exact: true }) },
    { name: 'IP Transfer', to: `${url}/transfer`, selected: matched(`${url}/transfer`) },
    { name: 'IP Sharing', to: `${url}/sharing`, selected: matched(`${url}/sharing`) },
    { name: 'DNS Resolvers', to: `${url}/resolvers`, selected: matched(`${url}/resolvers`) },
  ];

  return (
    <div>
      <TabsComponent tabs={tabs} parentClass="linode-tabs--sub" />
      <ChainedDocumentTitle title="Networking" />
      <Switch>
        <Route path={`${path}/resolvers`} component={DNSResolversPage} />
        <Route path={`${path}/transfer`} component={IPTransferPage} />
        <Route path={`${path}/sharing`} component={IPSharingPage} />
        <Route exact component={SummaryPage} />
        <Redirect to="/not-found" />
      </Switch>
    </div>
  );
};
const preloadRequest = async (dispatch, { match: { params: { linodeLabel } } }) => {
  const { region, id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

  await Promise.all([
    getIPs(id),
    ipv4s(region),
    api.linodes.all([], undefined, createHeaderFilter({ region })),
  ].map(dispatch));
};


export default compose(
  connect(),
  Preload(preloadRequest),
)(LinodeNetworkingIndex);
