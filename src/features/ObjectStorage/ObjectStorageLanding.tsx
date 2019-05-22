import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import TabLink from 'src/components/TabLink';
import { ApplicationState } from 'src/store';
import { getAllBuckets } from 'src/store/bucket/bucket.requests';
import { requestClusters as _requestClusters } from 'src/store/clusters/clusters.actions';
import { MapState } from 'src/store/types';
import AccessKeyLanding from './AccessKeys/AccessKeyLanding';
import BucketLanding from './Buckets/BucketLanding';

type CombinedProps = StateProps & DispatchProps & RouteComponentProps<{}>;

export const ObjectStorageLanding: React.FunctionComponent<
  CombinedProps
> = props => {
  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { title: 'Buckets', routeName: `${props.match.url}/buckets` },
    { title: 'Access Keys', routeName: `${props.match.url}/access-keys` }
  ];

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  React.useEffect(() => {
    const {
      bucketsLastUpdated,
      clustersLastUpdated,
      requestBuckets,
      requestClusters
    } = props;

    // When OBJ is generally available, consider moving
    // these requests to App.tsx like other entities.

    // Request buckets if we haven't already
    if (bucketsLastUpdated === 0) {
      requestBuckets();
    }

    // Request clusters if we haven't already
    if (clustersLastUpdated === 0) {
      requestClusters();
    }
  }, []);

  const {
    match: { url }
  } = props;
  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Object Storage" />
      <Typography variant="h1" data-qa-profile-header>
        Object Storage
      </Typography>
      <AppBar position="static" color="default">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName))}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
        >
          {tabs.map(tab => (
            <Tab
              key={tab.title}
              data-qa-tab={tab.title}
              component={() => <TabLink to={tab.routeName} title={tab.title} />}
            />
          ))}
        </Tabs>
      </AppBar>
      <Switch>
        <Route exact path={`${url}/buckets`} component={BucketLanding} />
        <Route exact path={`${url}/access-keys`} component={AccessKeyLanding} />
        <Route exact path={`${url}`} component={BucketLanding} />
      </Switch>
    </React.Fragment>
  );
};

interface StateProps {
  bucketsLastUpdated: number;
  clustersLastUpdated: number;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  bucketsLastUpdated: state.__resources.buckets.lastUpdated,
  clustersLastUpdated: state.__resources.clusters.lastUpdated
});

interface DispatchProps {
  requestBuckets: () => Promise<Linode.Bucket[]>;
  requestClusters: () => Promise<Linode.Cluster[]>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    requestBuckets: () => dispatch(getAllBuckets()),
    requestClusters: () => dispatch(_requestClusters())
  };
};

export const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const enhanced = compose<CombinedProps, {}>(
  connected,
  withRouter
);
export default enhanced(ObjectStorageLanding);
